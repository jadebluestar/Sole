"""
Sole — Flask Backend
Medical-grade foot health monitoring API for diabetic patients.
"""

import os
import json
import base64
from datetime import datetime, timedelta
from functools import wraps

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

from db import db, Patient, Scan, CheckIn, Caregiver, AlertLog, Baseline
from model import (
    infer_image, generate_heatmap, calculate_baseline,
    calculate_baseline_diff, calculate_trend, get_model
)

# ─── Application Setup ─────────────────────────────────────────────────────────
app = Flask(__name__)

# Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, '..', 'frontend', 'dist')

app.config['SQLALCHEMY_DATABASE_URI'] = (
    f"sqlite:///{os.path.join(BASE_DIR, 'sole.db')}"
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JSON_SORT_KEYS'] = False
app.config['PROPAGATE_EXCEPTIONS'] = True

# Initialize database
db.init_app(app)

# CORS configuration
CORS(app, resources={r'/api/*': {'origins': '*'}})

# Pre-load model at startup
with app.app_context():
    print('Loading ML model...')
    get_model()
    print('Model loaded.')


# ─── Authentication ────────────────────────────────────────────────────────────
CLINICIAN_PASSWORD = os.environ.get('CLINICIAN_PASSWORD', 'sole2026')


def clinician_auth(f):
    """Decorator for clinician endpoints."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth = request.headers.get('X-Clinic-Auth', '')
        if auth != CLINICIAN_PASSWORD:
            return jsonify({'error': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    return decorated_function


# ─── API Endpoints: Scan ──────────────────────────────────────────────────────

@app.route('/api/scan', methods=['POST'])
def scan_upload():
    """
    Receive foot image, run ML inference, save to database.
    
    Request JSON:
        {
            "patient_id": "string",
            "image": "base64-encoded JPEG"
        }
    
    Response: scan result with zones, grade, heatmap, recommendations
    """
    try:
        data = request.get_json(force=True)
    except Exception as e:
        return jsonify({'error': f'Invalid JSON: {e}'}), 400
    
    patient_id = data.get('patient_id', 'demo')
    image_b64 = data.get('image', '')
    
    if not image_b64:
        return jsonify({'error': 'Missing image data'}), 400
    
    # Run inference
    try:
        result = infer_image(image_b64)
    except Exception as e:
        print(f'Inference error: {e}')
        return jsonify({'error': f'Inference failed: {e}'}), 500
    
    # Extract results
    zones = result['zones']
    grade = result['grade']
    grade_label = result['grade_label']
    confidence = result['confidence']
    overall_risk = result['overall_risk']
    probabilities = result['probabilities']
    recommendations = result['recommendations']
    image_obj = result.get('image_for_heatmap')
    
    # Generate heatmap
    try:
        heatmap_b64 = generate_heatmap(image_obj, zones) if image_obj else ''
    except Exception as e:
        print(f'Heatmap generation error: {e}')
        heatmap_b64 = ''
    
    # Get previous scans for trend
    previous_scans = Scan.query.filter_by(patient_id=patient_id).order_by(
        Scan.timestamp.desc()
    ).limit(5).all()
    
    trend, trend_pct = calculate_trend(overall_risk, previous_scans)
    
    # Get or create baseline
    baseline_obj = Baseline.query.filter_by(patient_id=patient_id).first()
    if not baseline_obj and len(previous_scans) >= 3:
        # Auto-establish baseline
        baseline_data = calculate_baseline(list(reversed(previous_scans[:3])))
        baseline_obj = Baseline(
            patient_id=patient_id,
            heel_avg=baseline_data['heel'],
            ball_avg=baseline_data['ball'],
            arch_avg=baseline_data['arch'],
            toe_avg=baseline_data['toe'],
            scan_count=3,
        )
        db.session.add(baseline_obj)
        db.session.commit()
    
    # Calculate baseline difference
    baseline_diff = {}
    if baseline_obj:
        baseline_diff = calculate_baseline_diff(zones, {
            'heel': baseline_obj.heel_avg,
            'ball': baseline_obj.ball_avg,
            'arch': baseline_obj.arch_avg,
            'toe': baseline_obj.toe_avg,
        })
    
    # Create scan record
    scan = Scan(
        patient_id=patient_id,
        overall_risk=overall_risk,
        grade=grade,
        grade_label=grade_label,
        confidence=confidence,
        heel=zones['heel'],
        ball=zones['ball'],
        arch=zones['arch'],
        toe=zones['toe'],
        heatmap_b64=heatmap_b64,
        recommendations=json.dumps(recommendations),
        probabilities=json.dumps(probabilities),
        trend=trend,
        trend_pct=trend_pct,
        baseline_diff_heel=baseline_diff.get('heel', 0),
        baseline_diff_ball=baseline_diff.get('ball', 0),
        baseline_diff_arch=baseline_diff.get('arch', 0),
        baseline_diff_toe=baseline_diff.get('toe', 0),
    )
    db.session.add(scan)
    db.session.flush()  # Get the ID
    
    # Check caregiver alert thresholds
    caregivers = Caregiver.query.filter_by(patient_id=patient_id, alerts_enabled=True).all()
    for cg in caregivers:
        if overall_risk >= cg.alert_threshold:
            alert = AlertLog(
                patient_id=patient_id,
                caregiver_id=cg.id,
                trigger_reason=f'Risk score {overall_risk} exceeded threshold {cg.alert_threshold}',
                risk_score_at_trigger=overall_risk,
                scan_id=scan.id,
                caregiver_name=cg.name,
            )
            cg.last_alerted = datetime.utcnow()
            db.session.add(alert)
    
    # Check for rising trend alert (3 consecutive increases)
    if len(previous_scans) >= 3:
        last_three = sorted(previous_scans[:3], key=lambda s: s.timestamp)
        if (last_three[1].overall_risk > last_three[0].overall_risk and
            last_three[2].overall_risk > last_three[1].overall_risk and
            overall_risk > last_three[2].overall_risk):
            
            for cg in caregivers:
                alert = AlertLog(
                    patient_id=patient_id,
                    caregiver_id=cg.id,
                    trigger_reason='Risk score rising for 3 consecutive scans',
                    risk_score_at_trigger=overall_risk,
                    scan_id=scan.id,
                    caregiver_name=cg.name,
                )
                db.session.add(alert)
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'scan_id': scan.id,
        'grade': grade,
        'grade_label': grade_label,
        'confidence': confidence,
        'overall_risk': overall_risk,
        'zones': zones,
        'probabilities': probabilities,
        'recommendations': recommendations,
        'heatmap_b64': heatmap_b64,
        'trend': trend,
        'trend_pct': trend_pct,
        'baseline_diff': baseline_diff,
        'timestamp': scan.timestamp.isoformat(),
    }), 201


# ─── API Endpoints: Check-in ─────────────────────────────────────────────────

@app.route('/api/checkin', methods=['POST'])
def save_checkin():
    """
    Save daily health check-in: vitals, symptoms, notes.
    """
    data = request.get_json(force=True)
    patient_id = data.get('patient_id', 'demo')
    
    checkin = CheckIn(
        patient_id=patient_id,
        blood_sugar=data.get('blood_sugar'),
        steps=data.get('steps'),
        sleep_hours=data.get('sleep_hours'),
        sleep_quality=data.get('sleep_quality', ''),
        has_symptoms=data.get('has_symptoms', False),
        symptom_zones=json.dumps(data.get('symptom_zones', [])),
        symptom_type=data.get('symptom_type', ''),
        severity=data.get('severity', 0),
        notes=data.get('notes', ''),
    )
    db.session.add(checkin)
    db.session.commit()
    
    # Calculate streak
    checkin_count = CheckIn.query.filter_by(patient_id=patient_id).count()
    
    return jsonify({
        'success': True,
        'checkin_id': checkin.id,
        'streak': checkin_count,
        'timestamp': checkin.timestamp.isoformat(),
    }), 201


@app.route('/api/checkin/<int:checkin_id>', methods=['PUT'])
def update_checkin(checkin_id):
    """Edit a check-in."""
    checkin = CheckIn.query.get_or_404(checkin_id)
    data = request.get_json(force=True)
    
    for key in ['blood_sugar', 'steps', 'sleep_hours', 'sleep_quality', 'notes']:
        if key in data:
            setattr(checkin, key, data[key])
    
    if 'has_symptoms' in data:
        checkin.has_symptoms = data['has_symptoms']
        checkin.symptom_zones = json.dumps(data.get('symptom_zones', []))
        checkin.symptom_type = data.get('symptom_type', '')
        checkin.severity = data.get('severity', 0)
    
    db.session.commit()
    return jsonify({'success': True})


# ─── API Endpoints: Patient ───────────────────────────────────────────────────

@app.route('/api/patient', methods=['POST'])
def create_patient():
    """Create a new patient."""
    data = request.get_json(force=True)
    
    patient = Patient(
        id=data.get('patient_id', 'demo'),
        name=data.get('name', 'Patient'),
        age=data.get('age', 45),
        diabetes_type=data.get('diabetes_type', 'Type 2'),
        diagnosis_year=data.get('diagnosis_year', 2020),
    )
    db.session.add(patient)
    db.session.commit()
    
    return jsonify(patient.to_dict()), 201


@app.route('/api/patient/<patient_id>', methods=['GET'])
def get_patient(patient_id):
    """Get patient profile."""
    patient = Patient.query.get_or_404(patient_id)
    
    latest_scan = Scan.query.filter_by(patient_id=patient_id).order_by(
        Scan.timestamp.desc()
    ).first()
    checkins = CheckIn.query.filter_by(patient_id=patient_id).count()
    
    return jsonify({
        **patient.to_dict(),
        'latest_scan': latest_scan.to_dict() if latest_scan else None,
        'total_scans': Scan.query.filter_by(patient_id=patient_id).count(),
        'total_checkins': checkins,
    })


@app.route('/api/patient/<patient_id>/summary', methods=['GET'])
def patient_summary(patient_id):
    """Get patient health summary."""
    patient = Patient.query.get_or_404(patient_id)
    
    scans = Scan.query.filter_by(patient_id=patient_id).order_by(
        Scan.timestamp.desc()
    ).limit(30).all()
    latest_scan = scans[0] if scans else None
    
    checkins = CheckIn.query.filter_by(patient_id=patient_id).order_by(
        CheckIn.timestamp.desc()
    ).all()
    latest_checkin = checkins[0] if checkins else None
    
    caregivers = Caregiver.query.filter_by(patient_id=patient_id).all()
    alerts = AlertLog.query.filter_by(patient_id=patient_id).order_by(
        AlertLog.timestamp.desc()
    ).limit(10).all()
    
    baseline = Baseline.query.filter_by(patient_id=patient_id).first()
    
    return jsonify({
        'patient': patient.to_dict(),
        'latest_scan': latest_scan.to_dict() if latest_scan else None,
        'scan_count': len(scans),
        'latest_vitals': latest_checkin.to_dict() if latest_checkin else None,
        'checkin_streak': len(checkins),
        'caregivers': [cg.to_dict() for cg in caregivers],
        'recent_alerts': [a.to_dict() for a in alerts],
        'baseline': baseline.to_dict() if baseline else None,
        '7day_avg_risk': int(sum(s.overall_risk for s in scans[:7]) / max(len(scans[:7]), 1)) if scans else 0,
    })


# ─── API Endpoints: History ──────────────────────────────────────────────────

@app.route('/api/patient/<patient_id>/history', methods=['GET'])
def scan_history(patient_id):
    """Get scan history with optional filtering."""
    days = request.args.get('days', 30, type=int)
    
    cutoff = datetime.utcnow() - timedelta(days=days)
    scans = Scan.query.filter(
        Scan.patient_id == patient_id,
        Scan.timestamp >= cutoff,
    ).order_by(Scan.timestamp.asc()).all()
    
    return jsonify([s.to_dict() for s in scans])


@app.route('/api/patient/<patient_id>/checkins', methods=['GET'])
def checkin_history(patient_id):
    """Get check-in history."""
    days = request.args.get('days', 30, type=int)
    
    cutoff = datetime.utcnow() - timedelta(days=days)
    checkins = CheckIn.query.filter(
        CheckIn.patient_id == patient_id,
        CheckIn.timestamp >= cutoff,
    ).order_by(CheckIn.timestamp.asc()).all()
    
    return jsonify([c.to_dict() for c in checkins])


# ─── API Endpoints: Caregivers ───────────────────────────────────────────────

@app.route('/api/caregiver', methods=['POST'])
def add_caregiver():
    """Add a new caregiver."""
    data = request.get_json(force=True)
    
    caregiver = Caregiver(
        patient_id=data.get('patient_id', 'demo'),
        name=data['name'],
        relation=data.get('relation', ''),
        contact=data['contact'],
        alert_threshold=data.get('alert_threshold', 70),
        alerts_enabled=data.get('alerts_enabled', True),
    )
    db.session.add(caregiver)
    db.session.commit()
    
    return jsonify(caregiver.to_dict()), 201


@app.route('/api/caregiver/<int:caregiver_id>', methods=['PUT'])
def update_caregiver(caregiver_id):
    """Update caregiver settings."""
    caregiver = Caregiver.query.get_or_404(caregiver_id)
    data = request.get_json(force=True)
    
    if 'name' in data:
        caregiver.name = data['name']
    if 'relation' in data:
        caregiver.relation = data['relation']
    if 'contact' in data:
        caregiver.contact = data['contact']
    if 'alert_threshold' in data:
        caregiver.alert_threshold = data['alert_threshold']
    if 'alerts_enabled' in data:
        caregiver.alerts_enabled = data['alerts_enabled']
    
    db.session.commit()
    return jsonify(caregiver.to_dict())


@app.route('/api/caregiver/<int:caregiver_id>', methods=['DELETE'])
def delete_caregiver(caregiver_id):
    """Remove a caregiver."""
    caregiver = Caregiver.query.get_or_404(caregiver_id)
    db.session.delete(caregiver)
    db.session.commit()
    return '', 204


@app.route('/api/patient/<patient_id>/caregivers', methods=['GET'])
def list_caregivers(patient_id):
    """List all caregivers for a patient."""
    caregivers = Caregiver.query.filter_by(patient_id=patient_id).all()
    return jsonify([c.to_dict() for c in caregivers])


# ─── API Endpoints: Alert Log ────────────────────────────────────────────────

@app.route('/api/patient/<patient_id>/alerts', methods=['GET'])
def alert_history(patient_id):
    """Get alert history for patient."""
    alerts = AlertLog.query.filter_by(patient_id=patient_id).order_by(
        AlertLog.timestamp.desc()
    ).limit(50).all()
    return jsonify([a.to_dict() for a in alerts])


# ─── API Endpoints: Clinician Dashboard ──────────────────────────────────────

@app.route('/api/clinic/patients', methods=['GET'])
@clinician_auth
def clinic_all_patients():
    """Get all patients for clinician dashboard (sorted by risk)."""
    patients = Patient.query.all()
    result = []
    
    for patient in patients:
        latest_scan = Scan.query.filter_by(patient_id=patient.id).order_by(
            Scan.timestamp.desc()
        ).first()
        
        checkins = CheckIn.query.filter_by(patient_id=patient.id).count()
        
        result.append({
            'id': patient.id,
            'name': patient.name,
            'age': patient.age,
            'latest_risk': latest_scan.overall_risk if latest_scan else 0,
            'latest_grade': latest_scan.grade if latest_scan else 0,
            'trend': latest_scan.trend if latest_scan else 'unknown',
            'last_scan': latest_scan.timestamp.isoformat() if latest_scan else None,
            'checkin_streak': checkins,
        })
    
    # Sort by risk descending
    result.sort(key=lambda x: x['latest_risk'], reverse=True)
    return jsonify(result)


@app.route('/api/clinic/patient/<patient_id>', methods=['GET'])
@clinician_auth
def clinic_patient_detail(patient_id):
    """Get detailed patient profile for clinician."""
    patient = Patient.query.get_or_404(patient_id)
    
    scans = Scan.query.filter_by(patient_id=patient_id).order_by(
        Scan.timestamp.desc()
    ).all()
    checkins = CheckIn.query.filter_by(patient_id=patient_id).order_by(
        CheckIn.timestamp.desc()
    ).all()
    
    caregivers = Caregiver.query.filter_by(patient_id=patient_id).all()
    alerts = AlertLog.query.filter_by(patient_id=patient_id).order_by(
        AlertLog.timestamp.desc()
    ).all()
    
    return jsonify({
        'patient': patient.to_dict(),
        'scans': [s.to_dict() for s in scans],
        'checkins': [c.to_dict() for c in checkins],
        'caregivers': [cg.to_dict() for cg in caregivers],
        'alerts': [a.to_dict() for a in alerts],
        'total_scans': len(scans),
        'total_checkins': len(checkins),
    })


# ─── API Endpoints: AI Assistant ─────────────────────────────────────────────

@app.route('/api/chat', methods=['POST'])
def chat():
    """
    Chat with Sole Assistant AI.
    Uses Anthropic API if available, otherwise returns demo response.
    """
    data = request.get_json(force=True)
    message = data.get('message', '').strip()
    patient_id = data.get('patient_id', 'demo')
    
    if not message:
        return jsonify({'error': 'Empty message'}), 400
    
    # Gather patient context
    patient = Patient.query.get(patient_id)
    patient_name = patient.name if patient else 'Patient'
    
    scans = Scan.query.filter_by(patient_id=patient_id).order_by(
        Scan.timestamp.desc()
    ).limit(5).all()
    
    latest_checkin = CheckIn.query.filter_by(patient_id=patient_id).order_by(
        CheckIn.timestamp.desc()
    ).first()
    
    # Build context prompt
    scan_context = '\n'.join([
        f'  {s.timestamp.strftime("%b %d")}: overall {s.overall_risk}, '
        f'grade {s.grade}, heel {s.heel}, ball {s.ball}, arch {s.arch}, toe {s.toe}'
        for s in scans
    ]) or '  No scans yet.'
    
    vitals_context = (
        f'  Blood sugar: {latest_checkin.blood_sugar} mg/dL, '
        f'Steps: {latest_checkin.steps}, Sleep: {latest_checkin.sleep_hours}h'
        if latest_checkin
        else '  No vitals logged yet.'
    )
    
    system_prompt = f"""You are Sole Assistant, a compassionate AI companion for diabetic patients' foot health.
You have access to this patient's real health data:

PATIENT: {patient_name}, {patient.age}y, {patient.diabetes_type}
RECENT SCANS (last 5):
{scan_context}

LATEST VITALS:
{vitals_context}

INSTRUCTIONS:
1. Always reference their actual data. Be specific.
2. Use plain, friendly language — no medical jargon.
3. Keep replies to 2-3 sentences maximum.
4. Never diagnose. If risk > 70, recommend they see a doctor soon.
5. Be warm and supportive, not clinical.
6. If they ask about non-foot-health topics, gently redirect.
7. Respond in the same language they used."""
    
    # Try to use Anthropic API
    api_key = os.environ.get('ANTHROPIC_API_KEY')
    if api_key:
        try:
            import anthropic
            client = anthropic.Anthropic(api_key=api_key)
            response = client.messages.create(
                model='claude-opus-4-1-20250805',
                max_tokens=300,
                system=system_prompt,
                messages=[{'role': 'user', 'content': message}],
            )
            reply = response.content[0].text
            
            return jsonify({
                'reply': reply,
                'timestamp': datetime.utcnow().isoformat(),
            })
        except Exception as e:
            print(f'Anthropic API error: {e}')
            # Fall through to demo response
    
    # Demo response (no API key)
    demo_replies = [
        f"Based on your data, your foot health is stable at the moment. Keep up with daily inspections and monitor for any changes.",
        f"Your most recent scan shows a {scans[0].grade_label if scans else 'low risk'} reading. Continue following your podiatrist's recommendations.",
        f"High blood sugar directly affects foot nerve sensitivity. Maintaining good glucose control is one of the best preventive measures.",
        f"Regular check-ins and consistent scanning help catch changes early. You're doing great by staying proactive.",
        f"Your heel zone seems to be the area of focus based on recent scans. Make sure your footwear has good cushioning in that area.",
    ]
    
    import random
    reply = random.choice(demo_replies)
    
    return jsonify({
        'reply': reply,
        'timestamp': datetime.utcnow().isoformat(),
    })


# ─── SPA Fallback ────────────────────────────────────────────────────────────

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_spa(path):
    """Serve React SPA."""
    if path and path.startswith('api/'):
        return jsonify({'error': 'Not found'}), 404
    
    file_path = os.path.join(app.static_folder, path)
    
    if path and os.path.isfile(file_path):
        return send_from_directory(app.static_folder, path)
    
    index_path = os.path.join(app.static_folder, 'index.html')
    if os.path.exists(index_path):
        return send_from_directory(app.static_folder, 'index.html')
    
    return jsonify({
        'status': 'Sole backend running',
        'frontend': 'Not built yet (run: cd frontend && npm run build)',
    }), 200


# ─── Health Check ──────────────────────────────────────────────────────────

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({'status': 'ok', 'service': 'Sole Backend'}), 200


# ─── Error Handlers ───────────────────────────────────────────────────────────

@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Not found'}), 404


@app.errorhandler(500)
def server_error(e):
    return jsonify({'error': 'Server error', 'message': str(e)}), 500


# ─── CLI Commands ─────────────────────────────────────────────────────────────

@app.cli.command()
def init_db():
    """Initialize database."""
    with app.app_context():
        db.create_all()
        print('✓ Database initialized')


@app.cli.command()
def seed_demo():
    """Seed demo patient."""
    from seed import seed_demo_patient
    with app.app_context():
        seed_demo_patient(db)


# ─── Main ─────────────────────────────────────────────────────────────────────

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    
    debug = os.environ.get('FLASK_ENV') == 'development'
    port = int(os.environ.get('PORT', 5000))
    
    app.run(debug=debug, host='0.0.0.0', port=port)
