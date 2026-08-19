# AI-ML Module -- Full 8-Phase Build Plan

## Goal

Build the complete AI-ML side of the Product Intelligence Platform inside `AI-ML/`. The module takes product PDFs as input and produces trusted, explainable, structured product records, then layers knowledge, memory, discovery, reasoning, export, and bonus features on top.

---

## LLM Provider Strategy

| Provider | Role | When |
|---|---|---|
| **Local Ollama** (qwen2.5:7b default) | Primary for all dev/testing | Every call by default |
| **Groq** (llama-3.3-70b-versatile) | Sophisticated extraction, reasoning | When config says `provider: groq` |
| **Gemini** (gemini-2.5-flash) | Long-context tasks, complex reasoning | When config says `provider: gemini` |

A unified `llm_client.py` wraps **litellm** so every module calls one function. `instructor` sits on top for structured extraction with Pydantic models. Provider is selected per-call via a config dict or env var, defaulting to Ollama.

---

## Shared Contract

> [!NOTE]
> Skipped for now per user decision. `schema_models.py` will define a draft `TrustedProductRecord` dataclass. Once the teammate agrees on the shared JSON contract, `export_record.py` will map to it.

---

## Sample Data Strategy

Real PDF processing code will be written. Each test file will print a clear message showing where to drop sample PDFs:
```
tests/sample_pdfs/electrical/   -- drop 5-10 electrical datasheets here
tests/sample_pdfs/software/     -- drop 5-10 software spec sheets here
```

A small synthetic plain-text sample will also be included so the extraction pipeline can be smoke-tested end-to-end without real PDFs.

---

## Folder Structure

```
AI-ML/
  config/
    settings.py                    # env vars, provider defaults, paths
    llm_client.py                  # unified LLM client (litellm + instructor)

  ingestion/                       # Stage 0
    __init__.py
    parse_pdf.py
    ocr_fallback.py
    evidence_builder.py

  extraction/                      # Stage 1
    __init__.py
    schema_models.py
    extract_attributes.py

  validation/                      # Stage 1
    __init__.py
    rules.py
    validate_record.py

  confidence/                      # Stage 1
    __init__.py
    score_fields.py
    score_record.py

  taxonomy/                        # Stage 1
    __init__.py
    categories.py
    classify_taxonomy.py

  company_discovery/               # Stage 2
    __init__.py
    detect_industry.py
    industry_profiles.py
    schema_generator.py
    validation_generator.py

  knowledge/                       # Stage 3
    __init__.py
    embed_products.py
    compatibility.py
    similar_products.py
    supplier_comparison.py
    revision_history.py

  memory/                          # Stage 4
    __init__.py
    correction_log.py
    confidence_calibration.py
    memory_matrix.py

  discovery/                       # Stage 5
    __init__.py
    blank_space.py
    duplicate_detection.py
    missing_variant.py

  reasoning/                       # Stage 6
    __init__.py
    intent_search.py
    conflict_resolution.py
    evidence_comparison.py

  export/                          # Stage 7
    __init__.py
    export_record.py
    api_ready_output.py

  visual_match/                    # Stage 8 (bonus)
    __init__.py
    embed_product_images.py
    embed_text_snippets.py
    match_input.py

  risk_radar/                      # Stage 9 (bonus)
    __init__.py
    safety_rules_electrical.py
    safety_rules_software.py
    detect_risk.py

  onepager/                        # Stage 10 (bonus)
    __init__.py
    generate_onepager.py
    render_output.py

  pipeline/
    __init__.py
    run_pipeline.py
    run_knowledge_layer.py
    run_discovery_layer.py
    cli.py

  tests/
    sample_pdfs/
      electrical/
        .gitkeep
      software/
        .gitkeep
    test_extraction.py
    test_validation.py
    test_knowledge.py
    test_reasoning.py

  requirements.txt
  .env.example
  README.md
```

> [!IMPORTANT]
> Added `config/` with `settings.py` and `llm_client.py` -- these are not in the original spec but are required infrastructure for the unified LLM routing strategy.

---

## Proposed Changes -- Phase by Phase

### Phase 0 -- Infrastructure

#### [NEW] [requirements.txt](file:///c:/VK224/Hackathons/UNIHACK/Project/UNI-HACK/AI-ML/requirements.txt)
All dependencies: `pymupdf`, `pymupdf4llm`, `instructor`, `litellm`, `pydantic`, `chromadb`, `sentence-transformers`, `Pillow`, `python-dotenv`.

#### [NEW] [.env.example](file:///c:/VK224/Hackathons/UNIHACK/Project/UNI-HACK/AI-ML/.env.example)
Template for API keys (`GROQ_API_KEY`, `GEMINI_API_KEY`, `OLLAMA_BASE_URL`).

#### [NEW] [config/settings.py](file:///c:/VK224/Hackathons/UNIHACK/Project/UNI-HACK/AI-ML/config/settings.py)
Loads env vars, defines paths, default provider, model names.

#### [NEW] [config/llm_client.py](file:///c:/VK224/Hackathons/UNIHACK/Project/UNI-HACK/AI-ML/config/llm_client.py)
`get_completion(prompt, model, provider)` -- calls litellm under the hood.
`get_structured_output(prompt, response_model, model, provider)` -- calls instructor + litellm for Pydantic-validated extraction.

---

### Phase 1 -- Foundation (Stage 0-1)

#### [NEW] ingestion/parse_pdf.py
Extracts text + tables from a PDF using PyMuPDF/pymupdf4llm. Returns a list of page-level evidence dicts.

#### [NEW] ingestion/ocr_fallback.py
Detects if a page has minimal text (scanned). Falls back to Ollama vision model or Mistral OCR API.

#### [NEW] ingestion/evidence_builder.py
Combines parsed pages into a single `DocumentEvidence` dict with metadata, page texts, tables, and image references.

#### [NEW] extraction/schema_models.py
Pydantic models: `ProductAttribute`, `TrustedProductRecord`, `ExtractionResult`. These are the core data shapes used everywhere downstream.

#### [NEW] extraction/extract_attributes.py
Uses `instructor` + `llm_client` to extract a `TrustedProductRecord` from document evidence text. Zero-shot, schema-first.

#### [NEW] validation/rules.py
Defines validation rule types (required field, numeric range, unit consistency, regex pattern). Rules are plain dicts.

#### [NEW] validation/validate_record.py
Runs a list of rules against a `TrustedProductRecord`. Returns a `ValidationResult` with pass/fail per field and overall.

#### [NEW] confidence/score_fields.py
Scores each field: extraction confidence (from LLM), source agreement, completeness. Returns 0.0-1.0 per field.

#### [NEW] confidence/score_record.py
Aggregates field scores into a record-level confidence. Flags low-confidence fields for review.

#### [NEW] taxonomy/categories.py
Defines category taxonomies (UNSPSC-style) as a flat list. Used as few-shot context for the classifier.

#### [NEW] taxonomy/classify_taxonomy.py
Zero-shot LLM call: given a product name + description, classify into the taxonomy. Returns category + confidence.

---

### Phase 2 -- Adaptive (Stage 2)

#### [NEW] company_discovery/detect_industry.py
LLM classifies document evidence into an industry (electrical, software, etc.). Returns the profile key.

#### [NEW] company_discovery/industry_profiles.py
Two profile configs as Python dicts: `ELECTRICAL_PROFILE` and `SOFTWARE_PROFILE`. Each defines required fields, expected units, taxonomy hints, validation rules.

#### [NEW] company_discovery/schema_generator.py
Takes an industry profile, returns a dynamic Pydantic model (or field config dict) that Phase 1's extraction uses.

#### [NEW] company_discovery/validation_generator.py
Takes an industry profile, returns a list of validation rules for Phase 1's validation engine.

---

### Phase 3 -- Knowledge (Stage 3)

#### [NEW] knowledge/embed_products.py
Embeds trusted records into ChromaDB using sentence-transformers. Shared index reused by compatibility, similarity, discovery, and reasoning.

#### [NEW] knowledge/compatibility.py
Queries the embedding index for records compatible with a given product (same family, complementary attributes).

#### [NEW] knowledge/similar_products.py
Nearest-neighbor search for similar/alternative products.

#### [NEW] knowledge/supplier_comparison.py
Finds records for the same product from different suppliers. Compares attribute values side-by-side.

#### [NEW] knowledge/revision_history.py
Detects version/revision relationships between records (same part number, different revision dates).

---

### Phase 4 -- Memory (Stage 4)

#### [NEW] memory/correction_log.py
Appends human corrections to a local JSON file: field, old value, new value, timestamp, reason.

#### [NEW] memory/confidence_calibration.py
Reads the correction log, identifies fields that get corrected often, adjusts base confidence weights.

#### [NEW] memory/memory_matrix.py
Aggregates correction patterns by field and category. Returns a summary for the dashboard.

---

### Phase 5 -- Discovery (Stage 5)

#### [NEW] discovery/blank_space.py
Compares schema field coverage across records in a product family. Surfaces systematic gaps.

#### [NEW] discovery/duplicate_detection.py
Flags record pairs above a similarity threshold in the Phase 3 embedding index.

#### [NEW] discovery/missing_variant.py
Compares attribute value sets across similar products. Spots variants that should exist but don't.

---

### Phase 6 -- Reasoning (Stage 6)

#### [NEW] reasoning/intent_search.py
LLM turns a natural-language query into structured filters. Retrieves and ranks matching records with explanations.

#### [NEW] reasoning/conflict_resolution.py
When the same field has different values across sources, uses confidence scores + LLM to pick the best-supported value.

#### [NEW] reasoning/evidence_comparison.py
Returns a side-by-side view of conflicting source snippets for a field.

---

### Phase 7 -- Commerce (Stage 7)

#### [NEW] export/export_record.py
Formats the final trusted record into a JSON payload. (Shape will be finalized once the shared/ contract is agreed.)

#### [NEW] export/api_ready_output.py
Thin formatting layer the full-stack side calls. Wraps export_record output with metadata.

---

### Phase 8 -- Wow Factor (Bonus, Stages 8-10)

#### [NEW] visual_match/ (3 files)
Image embedding (CLIP/vision model), text snippet embedding, unified matching function.

#### [NEW] risk_radar/ (3 files)
Two rule sets (electrical, software), risk detection engine with LLM-generated explanations.

#### [NEW] onepager/ (2 files)
LLM generates a spec sheet from the trusted record. Renders to Markdown/HTML.

---

### Pipeline & Tests

#### [NEW] pipeline/run_pipeline.py
Chains Stages 0-2 into one trusted record.

#### [NEW] pipeline/run_knowledge_layer.py
Runs Stage 3 across the record set.

#### [NEW] pipeline/run_discovery_layer.py
Runs Stage 5 across the record set.

#### [NEW] pipeline/cli.py
CLI entry point: `python -m pipeline.cli ingest <pdf>`, `python -m pipeline.cli extract`, etc.

#### [NEW] tests/ (4 test files)
Each test is runnable independently. Prints clear messages about where to drop sample PDFs.

#### [NEW] README.md
How to set up, configure providers, run each stage independently, run the full pipeline.

---

## Open Questions

> [!IMPORTANT]
> **Ollama model availability**: The code will default to `qwen2.5:7b` via Ollama. Do you already have Ollama installed and this model pulled? If not, I will add setup instructions to the README.

> [!IMPORTANT]
> **Embedding model**: For ChromaDB embeddings, I plan to use `all-MiniLM-L6-v2` via sentence-transformers (runs locally, no API cost). For image embeddings in the bonus stage, I will use CLIP via `sentence-transformers` as well. Confirm this is acceptable or if you prefer a different model.

---

## Verification Plan

### Automated Tests
```bash
cd AI-ML
python -m ingestion.parse_pdf          # smoke test with a sample
python -m extraction.extract_attributes # extract from sample evidence
python -m validation.validate_record    # validate a sample record
python -m taxonomy.classify_taxonomy    # classify a sample product
python -m pipeline.cli ingest sample.pdf
python -m pytest tests/ -v
```

### Manual Verification
- Each module is independently runnable from CLI with `python -m <module>`
- Drop real PDFs into `tests/sample_pdfs/electrical/` and `tests/sample_pdfs/software/`, re-run pipeline
- Verify the same pipeline code works on both verticals with only config changes
