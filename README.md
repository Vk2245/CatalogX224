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
python -m uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
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

---

### 3. Start the Local AI Server (vLLM via WSL2)

The AI-ML pipeline is configured to route extraction tasks to a local OpenAI-compatible server. For the fastest token generation speeds on hardware with limited VRAM (e.g. RTX 3050 6GB), we use **vLLM** running inside **WSL2**.

**Steps to start vLLM inside WSL2 (Ubuntu):**

1. Install system prerequisites:
```bash
sudo apt update
sudo apt install python3-pip python3-venv
```

2. Create a virtual environment and install vLLM:
```bash
python3 -m venv vllm_env
source vllm_env/bin/activate
pip install vllm
```

3. Start the Inference Server (loads the 4-bit AWQ Qwen model):
```bash
VLLM_USE_FLASHINFER_SAMPLER=0 VLLM_WSL2_ENABLE_PIN_MEMORY=1 python3 -m vllm.entrypoints.openai.api_server --model Qwen/Qwen2-VL-2B-Instruct-AWQ --quantization awq --port 8000 --max-model-len 8192 --enforce-eager --gpu-memory-utilization 0.8
```

Once the vLLM server prints `Uvicorn running on http://0.0.0.0:8000`, the backend will automatically connect to it for all PDF extraction tasks!
