# Sole — Full-Stack Setup Guide

## Prerequisites

- Python 3.9+
- Node.js 18+
- npm or yarn

## Backend Setup (Port 5000)

```bash
cd backend

# 1. Install dependencies
pip install -r requirements.txt

# 2. Create .env file
cp .env.example .env

# 3. Add your ANTHROPIC_API_KEY to .env (optional, but recommended)
# Edit .env and add: ANTHROPIC_API_KEY=sk-...

# 4. Initialize database
flask init-db

# 5. Seed demo patient
flask seed-demo

# 6. Run backend
python app.py
```

Backend runs on **http://localhost:5000**

## Frontend Setup (Port 5173)

```bash
cd frontend

# 1. Create .env file
cp .env.example .env

# .env already points to backend (http://localhost:5000)

# 2. Install dependencies
npm install

# 3. Run frontend
npm run dev
```

Frontend runs on **http://localhost:5173**

## Quick Start (Both Together)

### Terminal 1: Backend
```bash
cd backend
python app.py
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```

Then open **http://localhost:5173** in your browser.

---

## Testing Integration

Once both are running:

1. Go to **Landing Page** → **Login**
2. Select **"Try Demo"** button
3. Frontend calls backend API → loads demo patient (Arjun Sharma)
4. Dashboard shows real data from backend

---

## Production Deployment

### Using Docker Compose

```bash
# From project root
docker-compose up
```

Runs on:
- Backend: http://localhost:5000
- Frontend: http://localhost:5173

### Environment Variables (Production)

**Backend** (`backend/.env`):
```
FLASK_ENV=production
ANTHROPIC_API_KEY=your_key_here
CLINICIAN_PASSWORD=change_me_to_secure_password
```

**Frontend** (`frontend/.env`):
```
VITE_API_URL=https://your-backend-domain.com
VITE_ENV=production
```

---

## API Endpoints (Verify Connection)

After backend is running, test endpoints:

```bash
# Health check
curl http://localhost:5000/health

# Get demo patient
curl http://localhost:5000/api/patient/demo

# Get demo patient summary
curl http://localhost:5000/api/patient/demo/summary
```

---

## Troubleshooting

### "Cannot reach backend" Error

1. **Backend not running?**
   ```bash
   ps aux | grep python
   ```
   Should see `python app.py` running on port 5000

2. **Wrong API URL?**
   ```bash
   cat frontend/.env
   # Should show: VITE_API_URL=http://localhost:5000
   ```

3. **Model not found warning?**
   - Backend will start with untrained model if `sole_best.pth` is missing
   - Place your trained model in `backend/sole_best.pth`
   - Restart backend

4. **Database locked?**
   ```bash
   cd backend
   rm sole.db
   flask init-db
   flask seed-demo
   ```

### Frontend shows "Loading..." forever

1. Check browser console for CORS errors
2. Backend CORS is enabled for `http://localhost:5173`
3. If issue persists, restart both servers

---

## File Locations

```
sole-health-companion/
├── backend/
│   ├── app.py                 (Flask application)
│   ├── db.py                  (Database models)
│   ├── model.py               (ML inference)
│   ├── seed.py                (Demo data)
│   ├── sole_best.pth          (Pre-trained model)
│   ├── sole.db                (SQLite database)
│   ├── requirements.txt
│   ├── .env                   (Local config)
│   └── .env.example           (Template)
│
├── frontend/
│   ├── src/
│   │   ├── lib/
│   │   │   ├── api.ts         (🆕 Backend API client)
│   │   │   ├── mockData.ts    (Data types)
│   │   │   └── translations.ts
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx (🔄 Updated for real API)
│   │   │   ├── LanguageContext.tsx
│   │   │   └── ThemeContext.tsx
│   │   ├── pages/
│   │   └── App.tsx
│   ├── .env                   (🆕 Local config)
│   ├── .env.example           (🆕 Template)
│   └── package.json
│
└── docker-compose.yml         (🆕 Local dev stack)
```

---

## What's New (Integration)

✅ **[lib/api.ts](lib/api.ts)** — API client for all backend endpoints
✅ **[contexts/AuthContext.tsx](contexts/AuthContext.tsx)** — Updated to call real backend
✅ **[.env](.env)** — Local backend URL configuration
✅ **[.env.example](.env.example)** — Template configuration

---

## Next Steps

1. **Start both servers** (follow Quick Start above)
2. **Test a demo scan**: Go to Dashboard → Scan
3. **Try the chat**: Click Sole Assistant → Ask a question
4. **View history**: Go to History page
5. **Add a caregiver**: Go to Care page

---

## Support

- Check `backend/README.md` for backend details
- Check `frontend/README.md` for frontend details
- API docs: `backend/app.py` (all endpoints documented)

