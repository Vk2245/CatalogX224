# Build Prompt — AI-ML Module (Product Intelligence Platform)
## Full 8-Stage Build (0-7)

Use this as the prompt for an AI coding assistant (or as your own build spec) to
generate the `AI-ML/` folder only. Do not touch `DEVELOPMENT/`.

---

## Context

I am building the AI/ML side of a Product Intelligence Platform for industrial
commerce, as one half of a 2-person hackathon team. My teammate owns the frontend,
backend, auth, database, and deployment in a separate `DEVELOPMENT/` folder. We share
one git repo with two branches (`ai-ml-dev`, `fullstack-dev`) that merge into `main`.
I only work inside `AI-ML/`, plus a `shared/` folder for JSON schemas and API
contracts that both sides agree on.

The AI-ML module takes a product PDF/catalog as input and produces a trusted,
explainable, structured product record as output, then builds on that record with
knowledge, memory, discovery, reasoning, and export layers — all 8 roadmap stages.

We do not have a labeled training dataset, and we are not fine-tuning a custom model.
Every stage is built as an LLM-driven, zero/few-shot module. This needs no training
data — only a handful of sample documents for testing and demo. We are demoing on
two verticals, not one: Electrical (physical/hardware) and Software/IT. The
challenge statement does not restrict this to physical industry, and showing the same
pipeline adapt live to two different domains is the strongest proof of the "adaptive
platform" claim. This needs two small sample sets (5-10 electrical datasheets, 5-10
software spec sheets) and two industry profile configs, not two separate codebases —
the pipeline code stays identical, only the config changes.

## Coding Style Rules (strict)

- Simple, readable Python. No clever one-liners, no unnecessary abstraction layers,
  no design patterns unless they clearly earn their place.
- One responsibility per file. Small functions with clear names. Type hints on every
  function signature.
- Every module is a separate, self-contained block: input in, output out, easy to
  test on its own without running the whole pipeline.
- Short docstring on every function explaining what it does in plain language, not
  what the code already says.
- No emojis anywhere — not in code comments, print statements, logs, or docs.
- No mega-files. If a file crosses roughly 150-200 lines, split it.
- Prefer plain dictionaries/dataclasses over deep class hierarchies.
- Every stage should be runnable and testable independently from the command line on
  a sample record, before it is wired into the full pipeline.
- Later stages (3-7) read from the trusted product record that stages 0-1 produce.
  Do not duplicate extraction logic inside later stages — always read the stored
  record, never re-parse the source document.

## Tech Stack (no training dataset required anywhere)

| Task | Tool | Why |
|---|---|---|
| PDF parsing (clean, native PDFs) | PyMuPDF / `pymupdf4llm` | Fastest for machine-generated PDFs |
| PDF parsing (complex layouts, tables) | Docling (IBM) or Marker | Layout-aware, structured Markdown/JSON output with table and reading-order preservation |
| OCR (scanned pages) | Mistral OCR API, or open Qwen2.5-VL / DeepSeek-OCR if local | Handles scanned/mixed-format pages |
| Structured attribute extraction | `instructor` + Pydantic on an LLM API | Schema-first extraction, auto-retry on invalid output, no training data |
| Confidence scoring | Self-consistency checks + rule-based scoring | Explainable, no model needed |
| Taxonomy mapping | Zero-shot embeddings + LLM confirmation | No labeled taxonomy dataset |
| Compatibility / similarity / duplicates | Sentence embeddings + ChromaDB | In-process, zero setup, reused across stages 3 and 5 |
| Memory / corrections log | Local JSON or SQLite file | No need for a full database on the AI side; the platform's real database owns persistence long-term |
| Reasoning / intent search / conflict resolution | LLM with the trusted records as context (retrieval over the same ChromaDB index) | No custom reasoning model needed |
| Export | Plain Python formatting into a JSON schema agreed in `shared/` | Full-stack side consumes this directly |
| Instant match (photo + text) | Vision-capable embedding model for photos (e.g. CLIP-style or a vision LLM's embedding endpoint), plain text embeddings for snippets, both indexed in ChromaDB | One matching function, two input types — no training data, reuses the Stage 3 index pattern |
| Safety/compliance risk radar | Rule config per industry profile + LLM to explain the flag in plain language | Deterministic rules for the check, LLM only for the human-readable explanation |
| Auto-generated one-pager | LLM prompt over the trusted record, rendered to Markdown/HTML | No new tooling, reuses `extraction` output |

## Folder Structure to Generate

```
AI-ML/
  ingestion/                       # Stage 0
    parse_pdf.py
    ocr_fallback.py
    evidence_builder.py

  extraction/                      # Stage 1
    schema_models.py
    extract_attributes.py

  validation/                      # Stage 1
    rules.py
    validate_record.py

  confidence/                      # Stage 1
    score_fields.py
    score_record.py

  taxonomy/                        # Stage 1
    categories.py
    classify_taxonomy.py

  company_discovery/               # Stage 2
    detect_industry.py
    industry_profiles.py           # config for at least two profiles: electrical, software
    schema_generator.py            # builds dynamic schema config from the industry profile
    validation_generator.py        # builds dynamic validation rules from the industry profile

  knowledge/                       # Stage 3
    embed_products.py              # shared embedding index, reused by discovery/reasoning too
    compatibility.py
    similar_products.py
    supplier_comparison.py
    revision_history.py

  memory/                          # Stage 4
    correction_log.py
    confidence_calibration.py
    memory_matrix.py

  discovery/                       # Stage 5
    blank_space.py
    duplicate_detection.py
    missing_variant.py

  reasoning/                       # Stage 6
    intent_search.py
    conflict_resolution.py
    evidence_comparison.py

  export/                          # Stage 7
    export_record.py
    api_ready_output.py

  visual_match/                    # Stage 8 (bonus)
    embed_product_images.py        # embeds catalog images extracted back in Stage 0 (electrical)
    embed_text_snippets.py         # embeds config lines/error logs/version strings (software)
    match_input.py                 # takes a photo or a text snippet, finds nearest catalog match

  risk_radar/                      # Stage 9 (bonus)
    safety_rules_electrical.py     # physical/safety rule set (e.g. missing IP rating)
    safety_rules_software.py       # software rule set (e.g. missing EOL date, license type)
    detect_risk.py                 # checks a trusted record against the matching rule set

  onepager/                        # Stage 10 (bonus)
    generate_onepager.py           # LLM turns a trusted record into a readable spec sheet
    render_output.py               # renders the generated content to Markdown/HTML

  pipeline/
    run_pipeline.py                # chains stages 0-2 into one trusted record
    run_knowledge_layer.py         # runs stage 3 across the record set
    run_discovery_layer.py         # runs stage 5 across the record set
    cli.py                         # command-line entry point for local testing

  tests/
    sample_pdfs/
      electrical/                  # 5-10 electrical datasheets
      software/                    # 5-10 software spec sheets
    test_extraction.py
    test_validation.py
    test_knowledge.py
    test_reasoning.py

  requirements.txt
  README.md                        # how to run each stage independently
```

## Build Order (phased, do not skip ahead)

**Phase 1 — Foundation (Stage 0-1)**
1. `ingestion/parse_pdf.py` — extract raw text/tables from one sample PDF, print and
   verify before moving on.
2. `extraction/schema_models.py` + `extract_attributes.py` — define the product
   schema, wire up `instructor`, extract one record.
3. `validation/` and `confidence/` — run on the extracted record.
4. `taxonomy/classify_taxonomy.py` — zero-shot category mapping for the record.

**Phase 2 — Adaptive (Stage 2)**
5. `company_discovery/detect_industry.py` + `industry_profiles.py` — infer industry,
   load its profile config. Build two profiles: `electrical` and `software`.
6. `schema_generator.py` + `validation_generator.py` — generate schema/validation
   config from whichever profile was detected, feed it back into Phase 1's extraction
   and validation. Test both profiles on their own sample sets before moving on.

**Phase 3 — Knowledge (Stage 3)**
7. `knowledge/embed_products.py` — embed every trusted record into ChromaDB.
8. `compatibility.py`, `similar_products.py` — nearest-neighbor queries over the index.
9. `supplier_comparison.py`, `revision_history.py` — compare records that reference
   the same product across sources or over time.

**Phase 4 — Memory (Stage 4)**
10. `memory/correction_log.py` — append every human correction to a local log with the
    field, old value, new value, and reason if given.
11. `confidence_calibration.py` — adjust `confidence/score_fields.py` weights using
    patterns from the correction log (e.g. a field that gets corrected often starts
    with a lower base confidence).
12. `memory_matrix.py` — aggregate correction patterns by field and category for the
    dashboard to display.

**Phase 5 — Discovery (Stage 5)**
13. `discovery/blank_space.py` — for a product family, compare which schema fields are
    populated across records to surface systematic gaps.
14. `duplicate_detection.py` — flag record pairs above a similarity threshold in the
    Phase 3 embedding index.
15. `missing_variant.py` — compare attribute value sets across similar products to
    spot variants that should exist but do not.

**Phase 6 — Reasoning (Stage 6)**
16. `reasoning/intent_search.py` — LLM turns a natural-language query ("corrosion
    resistant connector for outdoor use") into structured filters, then retrieves and
    ranks matching records with a short explanation for each result.
17. `conflict_resolution.py` — when the same field has different values across
    sources, use confidence scores plus an LLM check to pick and explain the
    best-supported value.
18. `evidence_comparison.py` — return a side-by-side view of conflicting source
    snippets for a field, for the human reviewer.

**Phase 7 — Commerce (Stage 7)**
19. `export/export_record.py` — format the final trusted record (plus knowledge and
    reasoning outputs) into the JSON contract agreed in `shared/`.
20. `api_ready_output.py` — thin formatting layer the full-stack side calls directly;
    confirm the exact response shape with your teammate before finalizing.

**Phase 8 — Wow Factor (optional, Stage 8-10)**
21. `visual_match/embed_product_images.py` — embed the product images already pulled
    out in Stage 0, for the electrical set.
22. `embed_text_snippets.py` + `match_input.py` — embed a few sample config
    lines/version strings for the software set, then one matching function that takes
    either a photo or a text snippet and returns the nearest catalog record.
23. `risk_radar/safety_rules_electrical.py` + `safety_rules_software.py` — 3-5 rules
    each (e.g. missing IP rating on an outdoor-rated connector; missing EOL date or
    license type on a software product). `detect_risk.py` picks the right rule set
    from the record's detected industry and returns flags with plain-language
    explanations.
24. `onepager/generate_onepager.py` — prompt the LLM with one trusted record, render a
    clean one-page spec sheet. Confirm it reads sensibly on a record from each
    vertical, not just one.

Build Phase 8 only after Phases 1-7 are stable. If time runs out, Phase 8 still works
as three pitch-deck slides describing the same three features.

## What to Ask Me For, If Anything Is Unclear

- Which LLM provider/API key to use
- The exact JSON contract in `shared/` before finalizing `schema_models.py` and
  `export_record.py`
- Confirming Electrical and Software/IT as the two demo verticals, and where to
  source the 5-10 sample documents for each

Generate the code file by file, in the phase order above, and keep each file runnable
on its own before moving to the next phase.
