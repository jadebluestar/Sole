"""
Sole — Demo Data Seeder
Create realistic demo patient with 14-day scan history and check-ins.
"""

import random
import json
from datetime import datetime, timedelta
from db import Patient, Scan, CheckIn, Caregiver, AlertLog, Baseline


RECOMMENDATIONS_BANK = {
    'heel': [
        ('Reduce standing time', 'Your heel is under sustained pressure. Aim for a 10-minute break every 30 minutes.'),
        ('Cushion your heel', 'Use gel heel inserts or thick-soled footwear today to redistribute pressure.'),
        ('Moisturise tonight', 'Apply urea-based cream to your heel before bed to prevent crack formation.'),
    ],
    'ball': [
        ('Avoid hard surfaces', 'The ball of your foot is stressed. Wear cushioned footwear and avoid walking barefoot.'),
        ('Foot elevation', 'Elevate your feet for 15 minutes after walking to reduce pressure buildup.'),
        ('Check your shoes', 'Ensure your shoes aren\'t too tight at the front — this directly affects ball-of-foot pressure.'),
    ],
    'arch': [
        ('Arch support recommended', 'Your arch zone shows early stress. Orthotics or arch-support insoles can significantly help.'),
        ('Gentle stretches', 'Roll a tennis ball under your foot for 2 minutes to relieve arch tension.'),
        ('Reduce flat footwear', 'Avoid completely flat shoes today — a small heel lift reduces arch strain.'),
    ],
    'toe': [
        ('Check for redness', 'Your toe zone is elevated. Inspect your toes today for any redness or blistering.'),
        ('Trim nails carefully', 'Ensure toenails are trimmed straight across to avoid pressure points.'),
        ('Roomy footwear', 'Switch to shoes with a wide toe box to prevent compression on toe zones.'),
    ],
    'general': [
        ('Book a check-up', 'Your overall risk is elevated. Consider scheduling a visit with your podiatrist this week.'),
        ('Stay off your feet', 'Limit standing and walking today. Rest is the most effective pressure relief.'),
        ('Log your blood sugar', 'High blood sugar directly affects nerve sensitivity. Ensure you\'ve logged today\'s reading.'),
    ],
}


def seed_demo_patient(db):
    """Seed demo patient with realistic data."""
    # Check if already exists
    if Patient.query.get('demo'):
        print('Demo patient already exists.')
        return
    
    print('Seeding demo patient...')
    
    # Create patient
    patient = Patient(
        id='demo',
        name='Arjun Sharma',
        age=58,
        diabetes_type='Type 2',
        diagnosis_year=2018,
    )
    db.session.add(patient)
    db.session.flush()
    
    # Generate scan sequence: stable → rising → critical
    base_date = datetime.utcnow() - timedelta(days=13)
    risk_sequence = [32, 35, 33, 38, 42, 47, 45, 52, 58, 61, 65, 68, 72, 74]
    
    grade_labels = {
        1: 'Superficial ulcer risk',
        2: 'Deep ulcer risk',
        3: 'Deep ulcer with abscess',
        4: 'Gangrene — critical',
    }
    
    prev_risk = None
    scans_list = []
    
    for i, overall in enumerate(risk_sequence):
        heel = min(100, overall + random.randint(2, 14))
        ball = max(0, overall - random.randint(5, 18))
        arch = max(0, overall - random.randint(18, 30))
        toe = max(0, overall - random.randint(8, 20))
        
        grade = 1 if overall < 40 else 2 if overall < 60 else 3 if overall < 80 else 4
        
        # Trend
        trend = 'stable'
        trend_pct = 0.0
        if prev_risk is not None:
            diff = overall - prev_risk
            trend_pct = abs(diff) / max(prev_risk, 1) * 100
            trend = 'increasing' if diff > 3 else 'decreasing' if diff < -3 else 'stable'
        
        # Probabilities
        probs = [random.uniform(5, 30), random.uniform(30, 70), random.uniform(5, 25), random.uniform(1, 15)]
        total = sum(probs)
        probabilities = {
            'Grade 1': round(probs[0] / total * 100, 1),
            'Grade 2': round(probs[1] / total * 100, 1),
            'Grade 3': round(probs[2] / total * 100, 1),
            'Grade 4': round(probs[3] / total * 100, 1),
        }
        
        # Recommendations
        worst_zone = max(
            {'heel': heel, 'ball': ball, 'arch': arch, 'toe': toe},
            key=lambda z: {'heel': heel, 'ball': ball, 'arch': arch, 'toe': toe}[z]
        )
        recs_pool = list(RECOMMENDATIONS_BANK[worst_zone]) + list(RECOMMENDATIONS_BANK['general'])
        selected = random.sample(recs_pool, min(3, len(recs_pool)))
        recommendations = [{'action': r[0], 'detail': r[1]} for r in selected]
        
        scan = Scan(
            patient_id='demo',
            timestamp=base_date + timedelta(days=i),
            overall_risk=overall,
            grade=grade,
            grade_label=grade_labels[grade],
            confidence=round(random.uniform(85, 96), 1),
            heel=heel,
            ball=ball,
            arch=arch,
            toe=toe,
            heatmap_b64='',
            recommendations=json.dumps(recommendations),
            probabilities=json.dumps(probabilities),
            trend=trend,
            trend_pct=trend_pct,
        )
        db.session.add(scan)
        db.session.flush()
        scans_list.append(scan)
        prev_risk = overall
    
    db.session.commit()
    print(f'✓ Created {len(scans_list)} scans')
    
    # Establish baseline from first 3 scans
    baseline = Baseline(
        patient_id='demo',
        heel_avg=sum(s.heel for s in scans_list[:3]) / 3,
        ball_avg=sum(s.ball for s in scans_list[:3]) / 3,
        arch_avg=sum(s.arch for s in scans_list[:3]) / 3,
        toe_avg=sum(s.toe for s in scans_list[:3]) / 3,
        scan_count=3,
    )
    db.session.add(baseline)
    db.session.commit()
    print('✓ Established baseline')
    
    # Add check-ins
    for i in range(7):
        checkin = CheckIn(
            patient_id='demo',
            timestamp=base_date + timedelta(days=i * 2),
            blood_sugar=random.randint(118, 195),
            steps=random.randint(2800, 7200),
            sleep_hours=round(random.uniform(5.5, 7.5), 1),
            sleep_quality=random.choice(['Poor', 'Fair', 'Good']),
            has_symptoms=i >= 5,
            symptom_zones=json.dumps(['heel'] if i >= 5 else []),
            symptom_type='Numbness' if i >= 5 else '',
            severity=5 if i >= 5 else 0,
            notes='Wearing new shoes' if i == 2 else 'Walked more than usual' if i == 4 else '',
        )
        db.session.add(checkin)
    
    db.session.commit()
    print('✓ Created check-ins')
    
    # Add caregiver
    caregiver = Caregiver(
        patient_id='demo',
        name='Priya Sharma',
        relation='Daughter',
        contact='priya@example.com',
        alert_threshold=70,
        alerts_enabled=True,
    )
    db.session.add(caregiver)
    db.session.flush()
    
    # Add alert logs
    alert1 = AlertLog(
        patient_id='demo',
        caregiver_id=caregiver.id,
        timestamp=scans_list[12].timestamp,
        trigger_reason='Risk score 72 exceeded threshold 70',
        risk_score_at_trigger=72,
        scan_id=scans_list[12].id,
        caregiver_name='Priya Sharma',
    )
    caregiver.last_alerted = scans_list[12].timestamp
    db.session.add(alert1)
    
    db.session.commit()
    print('✓ Created caregiver and alerts')
    print('✓ Demo data seeded successfully!')
