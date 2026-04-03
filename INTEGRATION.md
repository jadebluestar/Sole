# Sole — Integration Status

## ✅ Backend → Frontend Connection Complete

Both the backend and frontend are now fully configured to work together.

---

## 🚀 Quick Start

### Start Backend (Terminal 1)
```bash
cd backend
python app.py
```
Runs on: **http://localhost:5000**

### Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```
Runs on: **http://localhost:5173**

### Open Browser
Go to: **http://localhost:5173**

---

## 📡 What's Connected

### ✅ API Client
- **File**: `frontend/src/lib/api.ts` (NEW)
- **Handles**: All communication with backend
- **Endpoints**: Scan, Check-in, Patient, Caregiver, Chat, Clinic

### ✅ Authentication
- **File**: `frontend/src/contexts/AuthContext.tsx` (UPDATED)
- **Before**: Used mock data only
- **After**: Calls real backend API
- **Demo**: Loads Arjun Sharma from database

### ✅ Environment Configuration
- **Frontend .env**: `frontend/.env` (NEW)
- **Backend .env**: `backend/.env` (see .env.example)
- **API URL**: `http://localhost:5000`

### ✅ Database
- **Backend**: SQLite at `backend/sole.db`
- **Demo Patient**: Arjun Sharma (id: "demo")
- **Seeded Data**: 14 scans, 7 check-ins, caregivers, alerts

### ✅ ML Model
- **File**: `backend/sole_best.pth`
- **Architecture**: MobileNetV2 (4-class Wagner grade)
- **Input**: Foot images (base64)
- **Output**: Grade, zones, heatmap, recommendations

---

## 🔗 Data Flow

```
Frontend                          Backend
------------------------------------------------------------
Login Page        ──POST /api/patient/demo──>  Database
(Try Demo button)      Returns: Patient data    (SQLite)
                <──────────────────────────────
                
Dashboard         ──GET /api/patient/demo/summary──>  Database
(Load data)            Returns: Latest scan,           Queries
                       vitals, alerts                  baseline,
                <────────────────────────────────────  trends
                
Scan Page         ──POST /api/scan──>  PyTorch Model
(Upload image)    (base64 image)       (sole_best.pth)
                <─────────────────────  Returns: grade,
                  Receives: heatmap,    zones, confidence
                  zones, recommendations
                  
Chat Assist.      ──POST /api/chat──>  Anthropic API
(Ask question)    (message + context)  (Claude)
                <─────────────────────  Returns: reply
                  (or demo if no API key)
```

---

## 📝 Files Modified/Created

### Frontend
- **NEW**: `src/lib/api.ts` — API client
- **NEW**: `.env` — Local configuration
- **NEW**: `.env.example` — Configuration template
- **UPDATED**: `src/contexts/AuthContext.tsx` — Now calls real backend
- **UPDATED**: `package.json` — Added backend dev scripts

### Root
- **NEW**: `SETUP.md` — Full setup guide
- **NEW**: `INTEGRATION.md` — This file
- **NEW**: `docker-compose.yml` — Local dev stack
- **UPDATED**: `package.json` — Added scripts

### Backend (Already Complete)
- **app.py** — Flask API
- **db.py** — Database models
- **model.py** — ML inference
- **seed.py** — Demo data
- **requirements.txt** — Dependencies

---

## 🧪 Testing Integration

### 1. Health Check
```bash
curl http://localhost:5000/health
# Response: {"status": "ok", "service": "Sole Backend"}
```

### 2. Get Demo Patient
```bash
curl http://localhost:5000/api/patient/demo
# Response: Patient data (Arjun Sharma)
```

### 3. Get Demo Summary
```bash
curl http://localhost:5000/api/patient/demo/summary
# Response: Scans, check-ins, caregivers, alerts
```

### 4. Frontend Demo
1. Open http://localhost:5173
2. Click **Login**
3. Click **"Try Demo"**
4. Should load Arjun Sharma's dashboard
5. See real data from database

---

## 🔒 Security Notes

- Backend password: `sole2026` (change in `.env`)
- Frontend sends patient_id, backend validates with auth headers
- For clinician access: Use `X-Clinic-Auth: sole2026` header
- Images sent as base64 (consider compression for production)

---

## 📊 What You Can Test

### Patient Features
✅ View real dashboard with latest scan data
✅ Upload foot photos → Get ML predictions
✅ Log daily vitals → See check-in history
✅ Chat with Sole Assistant (Anthropic Claude)
✅ View scan history with trends
✅ Add caregivers → Receive alerts

### Clinician Features
✅ View all patients sorted by risk
✅ Access patient profiles
✅ See automated alerts
✅ View scan history

### Data Features
✅ Real Grad-CAM heatmaps
✅ Zone risk scores
✅ Trend analysis
✅ Baseline comparison
✅ Alert logs

---

## 🐛 Troubleshooting

### "Cannot connect to backend"
1. Is backend running? `cd backend && python app.py`
2. Is backend on port 5000? Check `frontend/.env`
3. CORS enabled: Backend has CORS enabled for `http://localhost:5173`

### "Model not found" warning
- Backend will work but use untrained model
- Place `sole_best.pth` in `backend/` directory
- Restart backend

### "Database locked"
```bash
cd backend
rm sole.db
flask init-db
flask seed-demo
```

### Chat not working
- No API key? Chat returns demo responses (fine for testing)
- Want real Claude? Add `ANTHROPIC_API_KEY` to `backend/.env`

---

## 🚢 Production Deployment

### Option 1: Docker Compose
```bash
docker-compose up
```

### Option 2: Separate Deployments
**Backend** (Heroku, AWS, etc):
- Push `backend/` folder
- Set `ANTHROPIC_API_KEY` env var
- Backend will run on provided PORT

**Frontend** (Vercel, Netlify, etc):
- Set `VITE_API_URL=https://your-backend.com` env var
- Deploy `frontend/dist` folder

---

## 📚 Documentation

- **Setup Guide**: `SETUP.md`
- **Backend Details**: `backend/README.md`
- **Frontend Details**: `frontend/src/App.tsx`
- **API Endpoints**: `backend/app.py` (all documented)

---

## ✨ Summary

The **Sole application is now fully integrated**:
- ✅ Frontend calls real backend API
- ✅ Backend connects to PyTorch model
- ✅ Data flows between frontend ↔ backend ↔ database
- ✅ Demo patient ready to test
- ✅ All pages functional with real data

**Start the servers and navigate to http://localhost:5173 to begin!**

