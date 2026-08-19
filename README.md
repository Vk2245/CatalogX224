# CatalogX (UNI-HACK)
Adaptive AI-powered Product Intelligence Platform that transforms scattered industrial product data into trusted, explainable, commerce-ready intelligence.

## 🚀 Getting Started

Follow these steps to run the platform locally on your machine.

### 1. Start the Backend (FastAPI + AI Pipeline)

The backend handles the AI extraction pipeline, database operations, and API endpoints.

**Using Docker (Recommended):**
From the root directory (`UNI-HACK/`):
```bash
docker-compose up --build
```
*This will spin up both the backend and frontend automatically.*

**Manual Setup (Windows PowerShell):**
Open a new terminal and navigate to the backend directory:
```powershell
cd DEV\backend

# 1. Activate the virtual environment
..\..\..\.venv\Scripts\activate

# 2. Start the Uvicorn server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

### 2. Start the Frontend (Next.js 14)

The frontend provides the SaaS dashboard, file upload interface, and admin console.

**Manual Setup:**
Open a new terminal and navigate to the frontend directory:
```bash
cd DEV/frontend

# Install dependencies (only needed the first time)
npm install

# Start the development server
npm run dev
```

The frontend will be available at [http://localhost:3000](http://localhost:3000).
