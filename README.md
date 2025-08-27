# Medical AI - Pneumonia Detection Web App

Monorepo containing:
- `frontend`: React (Vite) + TailwindCSS + Framer Motion + React Router
- `backend`: Node.js + Express + MongoDB (Mongoose)

## Quickstart

### Backend
```
cd backend
cp .env.example .env
# fill MONGODB_URI, JWT_SECRET, MODEL_API_URL
npm install
npm run dev
```

### Frontend
```
cd frontend
cp .env.example .env
# set VITE_API_URL to http://localhost:5000/api
npm install
npm run dev
```

## API Routes (prefixed by `/api`)
- POST `/signup`
- POST `/login`
- POST `/upload` (protected)
- GET  `/dashboard` (protected)
- GET  `/stats`

## Features
- JWT auth stored in localStorage
- Drag-and-drop upload
- Stats with animated counters
- Dashboard history with predictions and confidence