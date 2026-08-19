"""
Central configuration for the AI-ML pipeline.

Loads environment variables and provides default paths, model names,
and provider settings used across all modules.

Provider strategy:
  - qwen3.5:4b via Ollama is the SINGLE default for ALL tasks
    (extraction, validation, classification, scoring, reasoning)
  - Groq and Gemini are FALLBACK ONLY (worst case, when local fails)
  - nomic-embed-text via Ollama for text embeddings (local)
  - nomic-embed-vision-v1.5 via transformers for image embeddings (local)
"""

import os
from pathlib import Path
from dotenv import load_dotenv


# Load .env from the AI-ML root directory
_AI_ML_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(_AI_ML_ROOT / ".env")


# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

DATA_DIR = Path(os.getenv("DATA_DIR", _AI_ML_ROOT / "data"))
CHROMA_DB_DIR = Path(os.getenv("CHROMA_DB_DIR", DATA_DIR / "chroma_db"))
CORRECTION_LOG_PATH = Path(
    os.getenv("CORRECTION_LOG_PATH", DATA_DIR / "corrections.json")
)
REPORTS_DIR = Path(os.getenv("REPORTS_DIR", DATA_DIR / "reports"))
SAMPLE_PDFS_DIR = _AI_ML_ROOT / "tests" / "sample_pdfs"

# Ensure data directories exist
DATA_DIR.mkdir(parents=True, exist_ok=True)
CHROMA_DB_DIR.mkdir(parents=True, exist_ok=True)
REPORTS_DIR.mkdir(parents=True, exist_ok=True)


# ---------------------------------------------------------------------------
# Ollama (local, single primary provider for everything)
# ---------------------------------------------------------------------------

OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "qwen3.5:4b")
OLLAMA_EMBED_MODEL: str = os.getenv("OLLAMA_EMBED_MODEL", "nomic-embed-text")

# Local vision embedding model (runs via transformers, no API)
VISION_EMBED_MODEL: str = os.getenv(
    "VISION_EMBED_MODEL", "nomic-ai/nomic-embed-vision-v1.5"
)


# ---------------------------------------------------------------------------
# Groq (FALLBACK ONLY -- used when local quality is insufficient)
# ---------------------------------------------------------------------------

GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL: str = os.getenv("GROQ_MODEL", "groq/llama-3.3-70b-versatile")


# ---------------------------------------------------------------------------
# Gemini (FALLBACK ONLY -- used when local cannot handle long context)
# ---------------------------------------------------------------------------

GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini/gemini-2.5-flash")


# ---------------------------------------------------------------------------
# Provider mapping -- litellm model strings
# ---------------------------------------------------------------------------

PROVIDER_MODELS: dict[str, str] = {
    "local": f"ollama/{OLLAMA_MODEL}",
    "groq": GROQ_MODEL,
    "gemini": GEMINI_MODEL,
}

DEFAULT_PROVIDER: str = "local"
