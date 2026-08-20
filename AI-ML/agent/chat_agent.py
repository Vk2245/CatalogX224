"""
LangGraph-based RAG Chat Agent for CatalogX.

Provides a conversational interface over a user's product scan history.
Uses a simple StateGraph: retrieve → generate.

The agent is grounded ONLY in the user's own data — it will never
hallucinate or reveal another user's records.
"""

import re
from typing import Any, TypedDict

from langgraph.graph import StateGraph, END

from config.llm_client import get_completion
from config.settings import DEFAULT_PROVIDER


# ---------------------------------------------------------------------------
# State schema
# ---------------------------------------------------------------------------

class ChatState(TypedDict):
    user_question: str
    user_records: list[dict]       # All product records belonging to the user
    chat_history: list[dict]       # Previous messages [{"role": ..., "content": ...}]
    retrieved_context: str         # Relevant records serialized as text
    response: str                  # Final LLM answer
    provider: str                  # LLM provider to use


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _serialize_record(rec: dict) -> str:
    """Convert a product record dict into a readable text block."""
    lines = []
    lines.append(f"Product: {rec.get('product_name', 'Unknown')}")
    if rec.get("manufacturer"):
        lines.append(f"  Manufacturer: {rec['manufacturer']}")
    if rec.get("industry"):
        lines.append(f"  Industry: {rec['industry']}")
    if rec.get("category"):
        lines.append(f"  Category: {rec['category']}")
    if rec.get("part_number"):
        lines.append(f"  Part Number: {rec['part_number']}")
    if rec.get("record_confidence") is not None:
        lines.append(f"  Confidence Score: {rec['record_confidence']:.0%}")
    if rec.get("risk_level"):
        lines.append(f"  Risk Level: {rec['risk_level']}")
    if rec.get("validation_passed") is not None:
        lines.append(f"  Validation Passed: {'Yes' if rec['validation_passed'] else 'No'}")
    if rec.get("uploaded_at"):
        lines.append(f"  Uploaded: {rec['uploaded_at']}")
    if rec.get("original_filename"):
        lines.append(f"  Source File: {rec['original_filename']}")

    # Include key attributes from record_data if available
    record_data = rec.get("record_data", {})
    if isinstance(record_data, dict):
        attrs = record_data.get("attributes", record_data.get("extracted_attributes", []))
        if isinstance(attrs, list) and attrs:
            lines.append("  Key Attributes:")
            for attr in attrs[:15]:  # Cap at 15 to avoid context overflow
                if isinstance(attr, dict):
                    name = attr.get("name", attr.get("attribute", ""))
                    value = attr.get("value", "")
                    if name and value:
                        lines.append(f"    - {name}: {value}")

    return "\n".join(lines)


def _keyword_score(question: str, record: dict) -> int:
    """Simple keyword relevance scoring between question and record."""
    question_lower = question.lower()
    score = 0

    searchable_fields = [
        record.get("product_name", ""),
        record.get("manufacturer", ""),
        record.get("industry", ""),
        record.get("category", ""),
        record.get("part_number", ""),
        record.get("risk_level", ""),
        record.get("original_filename", ""),
    ]

    for field in searchable_fields:
        if field and isinstance(field, str):
            for word in re.split(r'\W+', field.lower()):
                if word and len(word) > 2 and word in question_lower:
                    score += 3

    # Check for risk/confidence keywords
    if any(w in question_lower for w in ["risk", "risky", "danger", "warning"]):
        if record.get("risk_level", "").lower() in ["high", "medium"]:
            score += 5
    if any(w in question_lower for w in ["confidence", "accurate", "quality", "score"]):
        score += 2
    if any(w in question_lower for w in ["all", "every", "list", "show", "scans", "products"]):
        score += 1  # Boost all records slightly for listing queries

    return score


# ---------------------------------------------------------------------------
# Graph nodes
# ---------------------------------------------------------------------------

def retrieve(state: ChatState) -> dict:
    """
    Retrieve relevant product records based on the user's question.

    For broad queries ("what have I scanned?"), returns all records.
    For specific queries, ranks by keyword relevance and returns top matches.
    """
    question = state["user_question"]
    records = state["user_records"]

    if not records:
        return {"retrieved_context": "No product records found for this account. The user has not scanned any documents yet."}

    question_lower = question.lower()

    # Check if it's a broad/listing query
    broad_keywords = ["all", "every", "list", "show me", "what have", "how many", "summary", "overview"]
    is_broad = any(kw in question_lower for kw in broad_keywords)

    if is_broad or len(records) <= 5:
        # Return all records for broad queries or small datasets
        context_parts = [f"=== Product {i+1} of {len(records)} ===\n{_serialize_record(r)}"
                        for i, r in enumerate(records)]
    else:
        # Rank by keyword relevance
        scored = [(r, _keyword_score(question, r)) for r in records]
        scored.sort(key=lambda x: x[1], reverse=True)
        # Take top 5 or all with score > 0
        top = [r for r, s in scored if s > 0][:5]
        if not top:
            top = records[:5]  # Fallback to first 5
        context_parts = [f"=== Product {i+1} of {len(top)} (relevant) ===\n{_serialize_record(r)}"
                        for i, r in enumerate(top)]

    return {"retrieved_context": "\n\n".join(context_parts)}


def generate(state: ChatState) -> dict:
    """
    Generate a conversational response grounded in the retrieved context.
    """
    system_prompt = """You are CatalogX Assistant, an AI chatbot for a Product Intelligence Platform.
You help users understand their product scan history and analysis results.

RULES:
1. ONLY answer from the product data provided in the context below. Never invent data.
2. If the user asks about something not in the context, say "I don't have that information in your scan history."
3. Be concise, helpful, and conversational.
4. When comparing products, use clear formatting.
5. You can discuss confidence scores, risk levels, industries, attributes, and any data present in the records.
6. Refer to scans/analyses naturally (e.g., "Your motor analysis shows..." instead of "Record 1 shows...")."""

    # Build chat context
    context = state["retrieved_context"]
    history = state.get("chat_history", [])
    question = state["user_question"]
    provider = state.get("provider", DEFAULT_PROVIDER)

    # Format chat history (last 6 turns max)
    history_text = ""
    if history:
        recent = history[-6:]
        history_parts = [f"{m['role'].title()}: {m['content']}" for m in recent]
        history_text = "\n".join(history_parts) + "\n\n"

    prompt = f"""USER'S PRODUCT DATA:
{context}

{f"CONVERSATION HISTORY:{chr(10)}{history_text}" if history_text else ""}CURRENT QUESTION: {question}

Respond helpfully based ONLY on the product data above."""

    response = get_completion(
        prompt=prompt,
        system_prompt=system_prompt,
        provider=provider,
        temperature=0.3,
        max_tokens=1024,
    )

    return {"response": response}


# ---------------------------------------------------------------------------
# Build the graph
# ---------------------------------------------------------------------------

def build_chat_graph() -> StateGraph:
    """Construct the LangGraph StateGraph for the chat agent."""
    graph = StateGraph(ChatState)

    graph.add_node("retrieve", retrieve)
    graph.add_node("generate", generate)

    graph.set_entry_point("retrieve")
    graph.add_edge("retrieve", "generate")
    graph.add_edge("generate", END)

    return graph.compile()


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

# Compile once at module level
_chat_graph = build_chat_graph()


def chat_with_records(
    question: str,
    user_records: list[dict],
    chat_history: list[dict] | None = None,
    provider: str = DEFAULT_PROVIDER,
) -> str:
    """
    Run the RAG chat agent on the user's question.

    Args:
        question: The user's natural language question.
        user_records: List of product record dicts belonging to this user.
        chat_history: Previous conversation messages.
        provider: LLM provider to use.

    Returns:
        The assistant's text response.
    """
    state: ChatState = {
        "user_question": question,
        "user_records": user_records,
        "chat_history": chat_history or [],
        "retrieved_context": "",
        "response": "",
        "provider": provider,
    }

    result = _chat_graph.invoke(state)
    return result["response"]


# ---------------------------------------------------------------------------
# CLI smoke test
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    sample_records = [
        {
            "product_name": "Pro-Series Industrial Motor 400V",
            "manufacturer": "IndustrialCorp",
            "industry": "Electrical",
            "record_confidence": 0.94,
            "risk_level": "low",
            "validation_passed": True,
            "uploaded_at": "2026-08-16",
        },
        {
            "product_name": "Paracetamol 500mg Tablet",
            "manufacturer": "PharmaGen",
            "industry": "Pharmaceutical",
            "record_confidence": 0.89,
            "risk_level": "medium",
            "validation_passed": True,
            "uploaded_at": "2026-08-15",
        },
    ]

    response = chat_with_records(
        question="What products have I scanned?",
        user_records=sample_records,
    )
    print(f"Assistant: {response}")
