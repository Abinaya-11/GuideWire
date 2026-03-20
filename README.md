# GuideWire — Local scaffold

Quick start (Windows):

1) Backend
- Open PowerShell, go to backend:
  cd "c:\Users\saipo\OneDrive\Desktop\guideWire\backend"
  npm install
- Copy your Firebase service account JSON to backend/serviceAccountKey.json
- Create .env (or set env vars) from .env.example
- Start server: npm start
- Start worker (in another terminal): npm run worker

2) Frontend
- cd "c:\Users\saipo\OneDrive\Desktop\guideWire\frontend"
- Use create-react-app or your preferred React scaffold; ensure src files are present
- Ensure REACT_APP_* env vars set and run the dev server.

3) ML
- cd "c:\Users\saipo\OneDrive\Desktop\guideWire\ml"
- python -m venv .venv
- .\\.venv\\Scripts\\activate
- pip install -r requirements.txt
- python train_model.py
