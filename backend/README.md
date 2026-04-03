"""
Sole — Backend README

Medical-grade diabetic foot health monitoring API.
Built with Flask, SQLAlchemy, PyTorch, and Anthropic.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

QUICK START

1. Install dependencies:
   pip install -r requirements.txt

2. Set up environment:
   cp .env.example .env
   # Edit .env to add your ANTHROPIC_API_KEY

3. Initialize database and seed demo:
   flask init-db
   flask seed-demo

4. Run development server:
   python app.py
   # Server runs on http://localhost:5000

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

REQUIREMENTS

Python 3.9+
PyTorch (CPU or GPU)
All packages in requirements.txt

Pre-trained model:
  sole_best.pth (trained on Google Colab)
  Should be placed in backend/ directory

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROJECT STRUCTURE

backend/
  ├── app.py              Flask application + all endpoints
  ├── db.py               SQLAlchemy models
  ├── model.py            PyTorch inference + Grad-CAM
  ├── seed.py             Demo data seeder
  ├── config.py           Configuration management
  ├── wsgi.py             Production WSGI entry point
  ├── sole_best.pth       Pre-trained MobileNetV2 model
  ├── sole.db             SQLite database (auto-created)
  ├── requirements.txt    Python dependencies
  ├── .env.example        Environment template
  ├── Procfile            Heroku deployment
  └── README.md           This file

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

API ENDPOINTS

──────────────────────────────────────────────

SCAN ENDPOINTS

POST /api/scan
  Upload foot image for ML inference
  Body: { "patient_id": "string", "image": "base64" }
  Returns: { grade, zones, heatmap_b64, recommendations, trend }

GET /api/patient/<patient_id>/history?days=30
  Get scan history (default 30 days)

──────────────────────────────────────────────

CHECK-IN ENDPOINTS

POST /api/checkin
  Log daily vitals (blood sugar, steps, sleep, symptoms)
  Body: { "patient_id": "string", "blood_sugar": int, ... }

GET /api/patient/<patient_id>/checkins?days=30
  Get check-in history

──────────────────────────────────────────────

PATIENT ENDPOINTS

POST /api/patient
  Create new patient
  Body: { "patient_id": "string", "name": "string", ... }

GET /api/patient/<patient_id>
  Get patient profile

GET /api/patient/<patient_id>/summary
  Get patient health summary (latest scan, vitals, caregivers, alerts)

──────────────────────────────────────────────

CAREGIVER ENDPOINTS

POST /api/caregiver
  Add new caregiver
  Body: { "patient_id": "string", "name": "string", "contact": "string", ... }

GET /api/patient/<patient_id>/caregivers
  List all caregivers for patient

PUT /api/caregiver/<caregiver_id>
  Update caregiver settings

DELETE /api/caregiver/<caregiver_id>
  Remove caregiver

──────────────────────────────────────────────

ALERT ENDPOINTS

GET /api/patient/<patient_id>/alerts
  Get alert history for patient

──────────────────────────────────────────────

AI ASSISTANT ENDPOINT

POST /api/chat
  Chat with Sole Assistant
  Body: { "patient_id": "string", "message": "string" }
  Returns: { "reply": "string", "timestamp": "ISO8601" }

──────────────────────────────────────────────

CLINICIAN DASHBOARD (requires auth header)

GET /api/clinic/patients
  Get all patients (sorted by risk) — requires X-Clinic-Auth: sole2026

GET /api/clinic/patient/<patient_id>
  Get patient details for clinician

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DATABASE SCHEMA

PATIENT
  id (PK), name, age, diabetes_type, diagnosis_year, created_at,
  baseline_established

SCAN
  id (PK), patient_id (FK), timestamp, overall_risk, grade, grade_label,
  confidence, heel, ball, arch, toe, heatmap_b64, recommendations (JSON),
  probabilities (JSON), trend, trend_pct, baseline_diff_*

CHECKIN
  id (PK), patient_id (FK), timestamp, blood_sugar, steps, sleep_hours,
  sleep_quality, has_symptoms, symptom_zones (JSON), symptom_type,
  severity, notes

CAREGIVER
  id (PK), patient_id (FK), name, relation, contact, alert_threshold,
  alerts_enabled, last_alerted

ALERTLOG
  id (PK), patient_id (FK), caregiver_id (FK), timestamp, trigger_reason,
  risk_score_at_trigger, scan_id (FK), caregiver_name

BASELINE
  id (PK), patient_id (FK), heel_avg, ball_avg, arch_avg, toe_avg,
  established_at, scan_count

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ENVIRONMENT VARIABLES

FLASK_ENV
  development | production

ANTHROPIC_API_KEY
  API key for Anthropic Claude (for AI assistant)
  If not set, chat endpoint returns demo responses

CLINICIAN_PASSWORD
  Password for clinician dashboard access
  Default: sole2026

MODEL_PATH
  Path to sole_best.pth model file
  Default: sole_best.pth

PORT
  Server port
  Default: 5000

DATABASE_URL
  SQLite database URL
  Default: sqlite:///sole.db

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ML MODEL DETAILS

Architecture
  MobileNetV2 backbone + custom 4-class head
  Classes: Grade 1, Grade 2, Grade 3, Grade 4 (Wagner classification)

Input
  224x224 RGB images
  ImageNet normalization

Outputs
  Predicted grade (1-4)
  Confidence percentage
  Zone scores (heel, ball, arch, toe) derived from probabilities
  Grad-CAM heatmap visualization

Training
  Trained on Google Colab with Wagner Grade dataset
  Model file: sole_best.pth

Inference
  Runs on CPU for deployment scalability
  ~500ms per image on CPU

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DEPLOYMENT

Heroku
  git push heroku main
  (Uses Procfile for web command)

Docker
  docker build -t sole-backend .
  docker run -p 5000:5000 -e ANTHROPIC_API_KEY=... sole-backend

Environmental Variables to Set
  ANTHROPIC_API_KEY (required for chat)
  CLINICIAN_PASSWORD (change from default)
  FLASK_ENV=production

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DEMO PATIENT

Once seeded, access demo patient as:
  patient_id: "demo"
  name: "Arjun Sharma"
  age: 58
  diabetes_type: "Type 2"

Includes
  14 scans over 14 days (stable → rising → critical)
  7 check-ins with daily vitals
  1 caregiver (Priya Sharma)
  2 alerts in log

Try the demo endpoints:
  GET /api/patient/demo
  GET /api/patient/demo/summary
  GET /api/patient/demo/history
  POST /api/chat with patient_id=demo

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TESTING

Command-line test scan:
  curl -X POST http://localhost:5000/api/scan \\
    -H "Content-Type: application/json" \\
    -d '{"patient_id": "demo", "image": "data:image/jpeg;base64,..."}'

Check health:
  curl http://localhost:5000/health

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TROUBLESHOOTING

Model not found
  Make sure sole_best.pth is in backend/ directory
  App will start with untrained model if not found

Import errors
  Run: pip install -r requirements.txt --upgrade

Database locked
  Delete sole.db and reinitialize:
    rm sole.db
    flask init-db
    flask seed-demo

Anthropic API errors
  Check ANTHROPIC_API_KEY is set correctly
  Chat will work in demo mode without API key

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECURITY NOTES

1. Clinician password is checked on every protected endpoint
   Change CLINICIAN_PASSWORD in production

2. Patient data is not encrypted in SQLite
   For HIPAA compliance, use encrypted database or cloud provider

3. Images are temporarily held in base64 format
   Consider streaming or temporary file cleanup

4. API keys should NEVER be committed
   Use .env file and .gitignore

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SUPPORT

For issues or questions, refer to main README.md

"""
