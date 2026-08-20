"""
Unified LLM client for the AI-ML pipeline.

Wraps litellm for multi-provider support and instructor for schema-validated
structured extraction. Every module calls these functions instead of
hitting provider APIs directly.

Default: qwen3.5:4b via Ollama (local, free, used for everything).
Fallback: Groq or Gemini (only when local quality is insufficient).
"""

from typing import Any, Optional, Type, TypeVar

import litellm
import instructor
from pydantic import BaseModel

from config.settings import (
    PROVIDER_MODELS,
    DEFAULT_PROVIDER,
    OLLAMA_BASE_URL,
    VLLM_BASE_URL,
    GROQ_API_KEY,
    GEMINI_API_KEY,
)

# Suppress litellm's verbose logging
litellm.suppress_debug_info = True

T = TypeVar("T", bound=BaseModel)


def _get_model_string(provider: str) -> str:
    """Map a provider key to the litellm model string."""
    if provider not in PROVIDER_MODELS:
        raise ValueError(
            f"Unknown provider '{provider}'. "
            f"Available: {list(PROVIDER_MODELS.keys())}"
        )
    return PROVIDER_MODELS[provider]


def _build_kwargs(provider: str) -> dict[str, Any]:
    """Build extra keyword arguments for litellm based on the provider."""
    kwargs: dict[str, Any] = {}

    if provider == "local":
        kwargs["api_base"] = OLLAMA_BASE_URL
        kwargs["num_ctx"] = 8192  # Increase context window for Ollama
    elif provider == "vllm":
        kwargs["api_base"] = VLLM_BASE_URL
        kwargs["api_key"] = "dummy-key"  # vLLM/OpenAI format requires a dummy key
    elif provider == "groq":
        kwargs["api_key"] = GROQ_API_KEY
    elif provider == "gemini":
        kwargs["api_key"] = GEMINI_API_KEY

    return kwargs


def get_completion(
    prompt: str,
    system_prompt: str = "",
    provider: str = DEFAULT_PROVIDER,
    temperature: float = 0.1,
    max_tokens: int = 4096,
) -> str:
    """
    Send a plain text prompt to the LLM and return the response string.

    Use this for free-form generation (explanations, summaries, classifications)
    where you do not need a validated Pydantic object back.

    Defaults to local qwen3.5:4b. Pass provider='groq' or 'gemini' only
    as a fallback when local quality is insufficient.
    """
    messages: list[dict[str, str]] = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})

    model = _get_model_string(provider)
    kwargs = _build_kwargs(provider)

    response = litellm.completion(
        model=model,
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens,
        **kwargs,
    )

    return response.choices[0].message.content


def get_structured_output(
    prompt: str,
    response_model: type[T],
    system_prompt: str = "",
    provider: str = DEFAULT_PROVIDER,
    temperature: float = 0.1,
    max_retries: int = 3,
    max_tokens: int = 4096,
) -> T:
    """
    Send a prompt to the LLM and return a validated Pydantic object.

    Uses instructor to auto-retry until the output matches the schema.
    This is the primary function for all structured extraction tasks.
    """
    if provider in ("local", "vllm"):
        json_instruction = (
            "You MUST return your response as a valid JSON object. "
            "Do NOT wrap it in markdown blocks. Do NOT include any explanations before or after the JSON."
        )
        if system_prompt:
            system_prompt += f"\n\n{json_instruction}"
        else:
            system_prompt = json_instruction

    messages: list[dict[str, str]] = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})

    model = _get_model_string(provider)
    kwargs = _build_kwargs(provider)

    # Create an instructor-patched client via litellm
    # Ollama and small vLLM models often fail with TOOLS mode, so use MD_JSON mode
    if provider in ("local", "vllm"):
        client = instructor.from_litellm(litellm.completion, mode=instructor.Mode.MD_JSON)
    else:
        client = instructor.from_litellm(litellm.completion)

    result = client.chat.completions.create(
        model=model,
        messages=messages,
        response_model=response_model,
        temperature=temperature,
        max_retries=max_retries,
        max_tokens=max_tokens,
        **kwargs,
    )

    return result


def get_embedding(
    text: str,
    model: Optional[str] = None,
) -> list[float]:
    """
    Generate a text embedding vector using the local Ollama embedding model.

    Uses nomic-embed-text by default. Returns a list of floats.
    """
    import ollama as ollama_client

    embed_model = model or "nomic-embed-text"
    response = ollama_client.embed(model=embed_model, input=text)
    return response["embeddings"][0]


def get_embeddings_batch(
    texts: list[str],
    model: Optional[str] = None,
) -> list[list[float]]:
    """
    Generate embedding vectors for a batch of texts in a single call.
    """
    import ollama as ollama_client

    embed_model = model or "nomic-embed-text"
    response = ollama_client.embed(model=embed_model, input=texts)
    return response["embeddings"]


def get_image_embedding(image_path: str) -> list[float]:
    """
    Generate an embedding vector for an image using nomic-embed-vision-v1.5.

    Runs fully locally via the transformers library (no API calls).
    Downloads the model on first use and caches it.
    """
    from transformers import AutoModel, AutoProcessor
    from PIL import Image
    import torch

    model_name = "nomic-ai/nomic-embed-vision-v1.5"

    processor = AutoProcessor.from_pretrained(model_name, trust_remote_code=True)
    model = AutoModel.from_pretrained(model_name, trust_remote_code=True)
    model.eval()

    image = Image.open(image_path).convert("RGB")
    inputs = processor(images=image, return_tensors="pt")

    with torch.no_grad():
        outputs = model(**inputs)

    # Use the last hidden state's CLS token as the embedding
    embedding = outputs.last_hidden_state[:, 0, :].squeeze().tolist()
    return embedding


# ---------------------------------------------------------------------------
# CLI smoke test
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    print("Testing LLM client...")
    print(f"Default provider: {DEFAULT_PROVIDER}")
    print(f"Model: {_get_model_string(DEFAULT_PROVIDER)}")
    print()

    # Test plain completion
    try:
        result = get_completion("Say 'hello' and nothing else.")
        print(f"Completion test: {result}")
    except Exception as e:
        print(f"Completion test failed (is Ollama running?): {e}")

    # Test embedding
    try:
        vec = get_embedding("test embedding")
        print(f"Embedding test: vector dim = {len(vec)}")
    except Exception as e:
        print(f"Embedding test failed: {e}")
