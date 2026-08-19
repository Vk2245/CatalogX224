# AI-Powered Product Intelligence Platform
## Refined Project Roadmap (UniHack, 2-Member Team)

---

## 1. Problem Statement

Industrial companies store product information across supplier PDFs, websites, Excel
sheets, catalogs, and ERP/PIM systems. The same product often shows up with
incomplete, conflicting, or messy data — missing attributes, inconsistent units, wrong
taxonomy, no source evidence, no confidence, no review workflow, and no easy way to
adapt to a new industry.

## 2. Solution in One Line

An adaptive AI platform that understands a company's domain, configures itself
automatically, turns scattered product information into trusted, explainable,
commerce-ready intelligence, and improves continuously from human feedback.

## 3. Four Core Layers

1. **Intelligent Data Acquisition** — pull raw evidence from PDFs, catalogs, websites.
2. **Product Intelligence Engine** — turn raw evidence into a trusted product record.
3. **Adaptive Platform Layer** — detect the company/industry and reconfigure schema,
   validation, and UI automatically.
4. **Knowledge & Commerce Intelligence** — connect products, find gaps, learn from
   corrections, export to business systems.

---

## 4. Stage-by-Stage Roadmap

| Stage | Name | Purpose | Key Features | Output |
|---|---|---|---|---|
| 0 | Data Acquisition | Collect product info | PDF ingestion, OCR, layout parsing, table/image extraction, metadata extraction | Unified Product Evidence |
| 1 | Product Intelligence Engine | Structure the evidence | Attribute + entity extraction, schema generation, taxonomy mapping, unit normalization, rule validation, confidence scoring, provenance, human review | Trusted Product Record |
| 2 | Adaptive Platform Layer | Auto-configure per company | Company discovery, industry profile engine, dynamic schema/validation, dynamic UI renderer | Adaptive Platform |
| 3 | Product Knowledge Layer | Connect products | Compatibility, similar/alternative products, supplier comparison, revision history | Connected Product Knowledge |
| 4 | Product Memory Layer | Learn from usage | Human corrections, reviewer feedback, confidence evolution, industrial memory matrix | Living Product Memory |
| 5 | Discovery & Opportunity | Find business gaps | Blank space discovery, missing variants, duplicate products, supplier gaps | Business Intelligence |
| 6 | Engineering Reasoning | Reason, not just extract | Intent-based search, conflict resolution, evidence comparison, best-value selection | Engineering Decision Support |
| 7 | Commerce Intelligence | Make it usable downstream | ERP/PIM integration, procurement support, export/search APIs | Trusted Commerce Intelligence |

### Bonus Stages 8-10 — Wow Factor (for demo and slides)

These sit on top of the trusted record from Stages 0-2 and are the parts a judge
actually remembers. Each is small to build since it reuses data already produced by
earlier stages, but visually they read as a much bigger platform.

| Stage | Name | Purpose | Key Features | Output |
|---|---|---|---|---|
| 8 | Instant Product Match ("Snap & Find") | Identify a product without manual search — from a photo (physical) or a text snippet (software) | Physical mode: embed catalog images, match an uploaded photo. Software mode: match a pasted config line, error log, or version string to the right product record. Same matching logic, two input types | Instant match, either vertical |
| 9 | Compliance & Safety Risk Radar | Catch spec gaps that cause real failures, not just missing data | Two rule sets, one per industry profile: electrical (e.g. missing IP rating on outdoor-rated gear, voltage/current mismatch) and software (e.g. missing end-of-support date, no security patch info, undefined license type), severity scoring, plain-language explanation | Risk-flagged product set, either vertical |
| 10 | Auto-Generated Product One-Pager | Turn the trusted JSON record into something a human can actually read | LLM generates a clean spec sheet/datasheet from the record, with confidence badges and clickable provenance — same generator works unchanged on both verticals | Commerce-ready document, exportable as PDF/HTML |

**Why these three:** Stage 8 gives you a genuinely fun live demo moment (hold up a
part or paste a log line, instant match, either vertical). Stage 9 directly reinforces
your own pitch line about wrong attributes causing operational failure — and showing
it fire correctly on two different rule sets is the clearest proof that the platform
is actually adaptive, not hardcoded to one industry. Stage 10 turns your JSON output
into something non-technical judges can read at a glance, instead of a wall of fields.

**Demo strategy — dual vertical:** since the challenge statement never restricts this
to physical industry, the strongest demo is showing the same pipeline adapt live to
two different verticals: Electrical (physical/hardware) and Software/IT. This is not
extra core-pipeline work — Stage 2 was already designed to be config-driven per
industry. It only means building two industry profile configs instead of one, and
collecting two small sample sets (5-10 electrical datasheets, 5-10 software spec
sheets) instead of one.

### Full build plan (all 8 stages, phased)

The plan is to actually build all 8 stages, not just pitch them. Every stage below is
implemented as an LLM-driven module (zero/few-shot, no training data), so each phase
stays small and can be built independently once the phase before it produces stable
output.

| Phase | Stage(s) | What gets built |
|---|---|---|
| 1 — Foundation | 0, 1 | Ingestion, OCR fallback, attribute extraction, validation, confidence scoring, provenance |
| 2 — Adaptive | 2 | Company/industry discovery, two industry profile configs (Electrical and Software/IT), dynamic schema + validation generation |
| 3 — Knowledge | 3 | Compatibility, similar/alternative products, supplier comparison, revision history — built on the same embedding index as taxonomy mapping |
| 4 — Memory | 4 | Correction logging, confidence recalibration from corrections, industrial memory matrix (a running log the extraction step consults) |
| 5 — Discovery | 5 | Blank space discovery (schema field coverage gaps across records), duplicate detection, missing-variant detection |
| 6 — Reasoning | 6 | Intent-based search (natural language to structured query), conflict resolution across sources, best-supported value selection |
| 7 — Commerce | 7 | Clean export payload (ERP/PIM-ready JSON), product/search API-ready output — full-stack side wires this into actual APIs |
| 8 — Wow Factor (optional) | 8, 9, 10 | Instant match in both modes (photo + text snippet), risk radar with both rule sets, auto-generated one-pager — build if Phases 1-7 are stable with time left, otherwise keep on the pitch deck |

Each phase only starts once the previous phase's output is stable, since phases 3-7
all read from the trusted product record that phases 1-2 produce. Build order matters
more than stage number — do not start Stage 5 before Stage 1's output is reliable, or
you will be finding gaps in bad data.

---

## 5. Team Split and Ownership

| Area | Owner | Folder |
|---|---|---|
| AI / ML (parsing, extraction, validation, confidence, taxonomy, company discovery, similarity) | AI/ML lead | `AI-ML/` |
| Frontend, backend, auth, database, job orchestration, deployment | Full-stack lead | `DEVELOPMENT/` |
| JSON schemas, API contracts, industry profile definitions, prompt templates | Both (read access) | `shared/` |

**Rule:** each person edits only their own folder. Both can open the other folder to
read for reference. Any change to `shared/` needs agreement from both before merging,
since it is the contract between the two sides.

### AI/ML responsibilities
- PDF/catalog parsing and OCR
- Attribute and entity extraction
- Schema generation and taxonomy mapping
- Validation engine and confidence scoring
- Explainability and provenance (link every field back to its source)
- Company/industry discovery and industry profile generation
- Compatibility and similarity engine (if time permits)

### Full-stack responsibilities
- Upload, dashboard, review queue, product/evidence viewer, dynamic form renderer
- Auth, tenant management, REST APIs, database, job queue
- Dynamic UI rendering driven by the AI side's schema/config output
- Deployment, CI/CD, logging, demo-day stability

---

## 6. Git Workflow

```
main
├── ai-ml-dev
├── fullstack-dev
└── feature/*
```

- AI/ML lead commits only inside `AI-ML/`
- Full-stack lead commits only inside `DEVELOPMENT/`
- Changes to `shared/` require both to agree before the PR
- Merge into `main` only after a quick integration test (does the AI output actually
  render correctly in the UI)

---

## 7. Demo Flow

1. Upload a product PDF (start with Electrical)
2. AI extracts structured attributes
3. Validation and confidence scoring run
4. Click a field, source evidence highlights (provenance)
5. Low-confidence fields go to human review
6. Company/industry is auto-detected as Electrical
7. UI adapts to the Electrical industry profile
8. Now upload a Software/IT product spec sheet — same pipeline, no code changes
9. Company/industry is auto-detected as Software, a different profile loads
10. UI adapts again, different required fields and validation this time — this is the
    moment that proves the "adaptive across industries" claim live
11. Compatibility/similar-product suggestions appear (if built)
12. Trusted record exported in a clean JSON format, for both verticals

---

## 8. Key Differentiators (for the pitch)

- Explainable AI with source-level provenance
- Adaptive company/industry discovery — same backbone, proven live across two
  different verticals (Electrical and Software/IT) in the demo, not just claimed
- Dynamic schema and validation generated from an industry profile, not hardcoded
- Confidence scoring at field and record level
- Photo-based product identification ("Snap & Find")
- Safety and compliance risk radar built on the same trusted data
- Auto-generated, human-readable product one-pagers
- Roadmap toward product memory, opportunity intelligence, and commerce integration

## 9. One-Line Pitch

An adaptive AI-powered Product Intelligence Platform that understands a company's
domain, configures itself automatically, transforms scattered product information into
trusted commerce-ready intelligence, and scales across industries through configurable
AI profiles.
