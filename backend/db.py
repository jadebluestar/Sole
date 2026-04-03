"""
Sole — Database Models
SQLAlchemy ORM models for patient data, scans, check-ins, caregivers, and alerts.
"""

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()


class Patient(db.Model):
    """Patient demographics and baseline setup."""
    __tablename__ = 'patients'
    
    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(100), nullable=False, default='Patient')
    age = db.Column(db.Integer, default=45)
    diabetes_type = db.Column(db.String(20), default='Type 2')  # Type 1, Type 2, Pre-diabetic
    diagnosis_year = db.Column(db.Integer, default=2020)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    baseline_established = db.Column(db.Boolean, default=False)
    
    # Relationships
    scans = db.relationship('Scan', backref='patient', lazy='dynamic', cascade='all, delete-orphan')
    checkins = db.relationship('CheckIn', backref='patient', lazy='dynamic', cascade='all, delete-orphan')
    caregivers = db.relationship('Caregiver', backref='patient', lazy='dynamic', cascade='all, delete-orphan')
    alerts = db.relationship('AlertLog', backref='patient', lazy='dynamic', cascade='all, delete-orphan')
    baseline = db.relationship('Baseline', backref='patient', uselist=False, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'age': self.age,
            'diabetes_type': self.diabetes_type,
            'diagnosis_year': self.diagnosis_year,
            'created_at': self.created_at.isoformat(),
            'baseline_established': self.baseline_established,
        }


class Scan(db.Model):
    """Individual foot scan with model prediction results."""
    __tablename__ = 'scans'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.String(50), db.ForeignKey('patients.id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Model outputs
    overall_risk = db.Column(db.Integer)  # 0-100
    grade = db.Column(db.Integer)  # 1-4
    grade_label = db.Column(db.String(100))
    confidence = db.Column(db.Float, default=0.0)  # 0-100
    
    # Zone scores (0-100 each)
    heel = db.Column(db.Integer)
    ball = db.Column(db.Integer)
    arch = db.Column(db.Integer)
    toe = db.Column(db.Integer)
    
    # Outputs
    heatmap_b64 = db.Column(db.Text, default='')  # Base64 encoded heatmap image
    recommendations = db.Column(db.Text, default='[]')  # JSON array
    probabilities = db.Column(db.Text, default='{}')  # JSON: {"Grade 1": 5.2, ...}
    
    # Trend analysis
    trend = db.Column(db.String(20), default='stable')  # increasing, stable, decreasing
    trend_pct = db.Column(db.Float, default=0.0)  # Percentage change vs previous
    
    # Baseline comparison
    baseline_diff_heel = db.Column(db.Integer, default=0)  # % above/below baseline
    baseline_diff_ball = db.Column(db.Integer, default=0)
    baseline_diff_arch = db.Column(db.Integer, default=0)
    baseline_diff_toe = db.Column(db.Integer, default=0)
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'timestamp': self.timestamp.isoformat(),
            'overall_risk': self.overall_risk,
            'grade': self.grade,
            'grade_label': self.grade_label,
            'confidence': self.confidence,
            'zones': {
                'heel': self.heel,
                'ball': self.ball,
                'arch': self.arch,
                'toe': self.toe,
            },
            'heatmap_b64': self.heatmap_b64,
            'recommendations': json.loads(self.recommendations) if self.recommendations else [],
            'probabilities': json.loads(self.probabilities) if self.probabilities else {},
            'trend': self.trend,
            'trend_pct': self.trend_pct,
            'baseline_diff': {
                'heel': self.baseline_diff_heel,
                'ball': self.baseline_diff_ball,
                'arch': self.baseline_diff_arch,
                'toe': self.baseline_diff_toe,
            },
        }


class CheckIn(db.Model):
    """Daily health check-in: vitals, symptoms, notes."""
    __tablename__ = 'checkins'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.String(50), db.ForeignKey('patients.id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Vitals
    blood_sugar = db.Column(db.Integer)  # mg/dL
    steps = db.Column(db.Integer)
    sleep_hours = db.Column(db.Float)
    sleep_quality = db.Column(db.String(20), default='')  # Poor, Fair, Good
    
    # Symptoms
    has_symptoms = db.Column(db.Boolean, default=False)
    symptom_zones = db.Column(db.Text, default='[]')  # JSON array: ['heel', 'ball']
    symptom_type = db.Column(db.String(50), default='')  # Pain, Numbness, Tingling, Swelling
    severity = db.Column(db.Integer, default=0)  # 1-10
    
    # Notes
    notes = db.Column(db.Text, default='')
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'timestamp': self.timestamp.isoformat(),
            'blood_sugar': self.blood_sugar,
            'steps': self.steps,
            'sleep_hours': self.sleep_hours,
            'sleep_quality': self.sleep_quality,
            'has_symptoms': self.has_symptoms,
            'symptom_zones': json.loads(self.symptom_zones) if self.symptom_zones else [],
            'symptom_type': self.symptom_type,
            'severity': self.severity,
            'notes': self.notes,
        }


class Caregiver(db.Model):
    """Caregiver contact and alert settings."""
    __tablename__ = 'caregivers'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.String(50), db.ForeignKey('patients.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    relation = db.Column(db.String(50), default='')  # Spouse, Parent, Child, Friend, Doctor
    contact = db.Column(db.String(100), nullable=False)  # Email or phone
    alert_threshold = db.Column(db.Integer, default=70)  # Alert when risk exceeds this
    alerts_enabled = db.Column(db.Boolean, default=True)
    last_alerted = db.Column(db.DateTime, default=None)
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'name': self.name,
            'relation': self.relation,
            'contact': self.contact,
            'alert_threshold': self.alert_threshold,
            'alerts_enabled': self.alerts_enabled,
            'last_alerted': self.last_alerted.isoformat() if self.last_alerted else None,
        }


class AlertLog(db.Model):
    """History of caregiver alerts sent."""
    __tablename__ = 'alerts'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.String(50), db.ForeignKey('patients.id'), nullable=False)
    caregiver_id = db.Column(db.Integer, db.ForeignKey('caregivers.id'), nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    trigger_reason = db.Column(db.String(255), nullable=False)  # Why alert was triggered
    risk_score_at_trigger = db.Column(db.Integer)
    scan_id = db.Column(db.Integer, db.ForeignKey('scans.id'), nullable=True)
    caregiver_name = db.Column(db.String(100), default='')  # Denormalized for history display
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'timestamp': self.timestamp.isoformat(),
            'trigger_reason': self.trigger_reason,
            'risk_score_at_trigger': self.risk_score_at_trigger,
            'scan_id': self.scan_id,
            'caregiver_name': self.caregiver_name,
        }


class Baseline(db.Model):
    """Patient's established baseline (first 3 scans average)."""
    __tablename__ = 'baseline'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.String(50), db.ForeignKey('patients.id'), unique=True, nullable=False)
    heel_avg = db.Column(db.Float, default=0.0)
    ball_avg = db.Column(db.Float, default=0.0)
    arch_avg = db.Column(db.Float, default=0.0)
    toe_avg = db.Column(db.Float, default=0.0)
    established_at = db.Column(db.DateTime, default=datetime.utcnow)
    scan_count = db.Column(db.Integer, default=0)  # Number of scans used to establish
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'heel_avg': self.heel_avg,
            'ball_avg': self.ball_avg,
            'arch_avg': self.arch_avg,
            'toe_avg': self.toe_avg,
            'established_at': self.established_at.isoformat(),
            'scan_count': self.scan_count,
        }
