# AI-Powered Product Intelligence Platform
## UniHack Project README

## What we are making

We are building an adaptive AI-powered Product Intelligence Platform for industrial commerce.

The system takes messy product information from PDFs, catalogs, websites, and structured exports, then converts it into:
- trusted product records
- explainable attributes with evidence
- validated commerce-ready data
- compatibility and product relationship intelligence
- dynamic company-specific UI and schema behavior

The product is designed for industrial data, where a wrong attribute can cause operational failure, compliance issues, or procurement mistakes.

---

## Problem we are solving

Industrial companies store product information in many places:
- supplier PDFs
- websites
- Excel sheets
- product catalogs
- ERP/PIM systems

The same product may appear with incomplete, conflicting, or messy information.

Typical problems:
- missing technical attributes
- inconsistent units
- wrong taxonomy
- no source evidence
- no confidence scoring
- no review workflow
- no easy way to adapt the system for different industries

---

## Our solution

Our platform has 4 major layers:

### 1. Intelligent Data Acquisition
We ingest product information from PDFs, websites, catalogs, and other documents.

### 2. Product Intelligence Engine
We extract structured attributes, map taxonomies, normalize units, validate values, and generate confidence scores with provenance.

### 3. Adaptive Platform Layer
The system detects the company/industry and adapts the schema, validation rules, and UI to match that domain.

### 4. Knowledge and Commerce Intelligence
We connect products, discover alternatives, detect catalog gaps, learn from corrections, and export trusted data into ERP/PIM/procurement workflows.

---

## Core roadmap

### Stage 0 — Intelligent Data Acquisition
Collect product data from:
- PDF datasheets
- spec sheets
- catalogs
- websites
- structured files

Output:
- unified product evidence

### Stage 1 — Product Intelligence Engine
Convert raw evidence into structured product intelligence.

Includes:
- attribute extraction
- entity extraction
- schema generation
- taxonomy mapping
- unit normalization
- validation
- confidence scoring
- explainable provenance
- human review

Output:
- trusted product record

### Stage 2 — Adaptive Platform Layer
Automatically configure the platform for each company/industry.

Includes:
- automatic company discovery
- industry profile engine
- dynamic schema engine
- dynamic validation engine
- dynamic UI renderer

Output:
- adaptive product intelligence platform

### Stage 3 — Product Knowledge Layer
Connect products with each other.

Includes:
- compatibility suggestions
- similar products
- alternatives
- supplier comparison
- revision history
- product relationships

Output:
- connected product knowledge

### Stage 4 — Product Memory Layer
The system learns from corrections, approvals, and recalls.

Includes:
- reviewer feedback
- recall history
- confidence evolution
- industrial memory matrix
- continuous learning

Output:
- living product memory

### Stage 5 — Discovery & Opportunity Intelligence
Go beyond catalogs and find opportunities.

Includes:
- blank space discovery
- missing product variants
- portfolio opportunities
- duplicate products
- supplier gaps
- missing attributes
- obsolete products
- cross-catalog inconsistencies

Output:
- business intelligence

### Stage 6 — Engineering Reasoning Layer
Reason over the evidence instead of only extracting it.

Includes:
- intent-based industrial search
- conflict resolution across sources
- evidence comparison
- explainable recommendations
- best-supported value selection

Output:
- engineering decision support

### Stage 7 — Commerce Intelligence
Export trusted product intelligence into business systems.

Includes:
- ERP integration
- PIM integration
- procurement support
- marketplace onboarding
- export APIs
- product APIs
- search APIs

Output:
- trusted commerce intelligence

---

## Why this is different

This is not just a document extraction tool.

It is:
- a product intelligence engine
- an adaptive industry-aware platform
- a learning system
- a knowledge network
- a commerce-ready data layer

The key differentiator is that the platform changes itself depending on the company and industry.

---

## What the user sees

A user uploads a document.

The platform:
1. extracts product information
2. validates it
3. highlights the evidence
4. shows confidence
5. sends uncertain items for review
6. adapts the UI based on the company profile
7. suggests related products and alternatives
8. identifies missing opportunities
9. exports trusted records

---

## Example use case

### Electrical industry
A company uploads relay and contactor datasheets.

The system detects:
- electrical industry
- required fields like voltage, current, frequency, and compliance
- electrical-specific validation rules
- electrical UI sections

It then:
- extracts attributes
- shows bounding-box provenance
- validates numeric ranges
- suggests compatible parts
- learns from corrections

### Software / IT industry
A company uploads software product sheets.

The system detects:
- software industry
- required fields like version, license, compatibility, support lifecycle
- software-specific validation rules
- software-specific UI sections

It then adapts the same backbone to a very different product domain.

---

## Team structure

We are a 2-member team.

### Member 1 — AI / ML
Responsible for the intelligence side of the platform.

### Member 2 — Full Stack / Backend / Deployment
Responsible for the application, APIs, UI, infrastructure, and deployment.

---

## AI / ML tasks

All work for this role stays inside the `ai_ml/` folder.

### 1. Data ingestion and parsing
Tasks:
- parse PDFs, catalogs, and structured documents
- perform OCR where needed
- extract tables and diagrams
- preserve reading order
- preserve bounding box coordinates
- create unified document evidence objects

### 2. Attribute extraction
Tasks:
- identify product fields
- extract manufacturer, part number, taxonomy, and technical attributes
- group fields by product family
- output structured JSON

### 3. Schema generation
Tasks:
- build schemas for product families
- create reusable schema templates
- support category-specific required fields
- emit typed extraction output

### 4. Taxonomy mapping
Tasks:
- map product records into UNSPSC or similar taxonomy
- normalize category names
- support class/family/segment mapping
- keep taxonomy outputs explainable

### 5. Validation engine
Tasks:
- check numeric ranges
- verify unit consistency
- verify required fields
- reject impossible values
- apply category-specific business rules

### 6. Confidence scoring
Tasks:
- compute field confidence
- compute record confidence
- combine extraction quality, source agreement, and self-consistency
- flag low-confidence fields for review

### 7. Explainability and provenance
Tasks:
- link each field to a source snippet
- preserve page/row/cell reference
- expose source evidence for UI
- support bounding-box provenance data

### 8. Automatic company discovery
Tasks:
- infer company industry from website/PDF/product names
- detect product domain and product family
- suggest an industry profile automatically

### 9. Industry profile engine
Tasks:
- define industry profiles
- create required fields per industry
- define validation rules per industry
- define category-specific schema configuration

### 10. Dynamic schema and validation support
Tasks:
- generate schema configs from industry profile
- generate validation rules from industry profile
- maintain per-company overrides

### 11. Product knowledge intelligence
Tasks:
- find compatibility candidates
- identify alternative products
- support supplier comparison
- detect revision relationships

### 12. Blank space discovery
Tasks:
- detect missing catalog gaps
- compare product families
- identify missing variants
- recommend possible product opportunities

### 13. Industrial memory matrix
Tasks:
- store human corrections
- aggregate anonymous error patterns
- improve future confidence calibration
- learn from recall and revision history

### 14. Intent-based industrial search
Tasks:
- convert natural-language engineering intent into search queries
- rank products by goal fit
- return explainable reasoning

---

## Full Stack / Backend / Deployment tasks

All work for this role stays inside the `platform/` folder.

### 1. Frontend application
Tasks:
- build upload screen
- build dashboard
- build review queue
- build product viewer
- build evidence viewer
- build dynamic forms
- build dynamic UI renderer
- build search interface
- build admin panel

### 2. Authentication and organization support
Tasks:
- sign-in and sign-up
- tenant/company-based access
- role-based access
- company profile management
- user profile management

### 3. Backend APIs
Tasks:
- upload API
- extraction job API
- review API
- approval API
- search API
- export API
- profile management API
- tenant management API

### 4. Job orchestration
Tasks:
- handle long-running extraction jobs
- track processing status
- support job retries
- expose progress updates
- prevent UI blocking

### 5. Database and storage
Tasks:
- store product records
- store evidence metadata
- store confidence data
- store validation results
- store company profiles
- store industry profiles
- store corrections and history

### 6. Dynamic UI rendering
Tasks:
- render forms from JSON/config
- show different fields per company
- show different validation states per industry
- support adaptive sections and widgets

### 7. Platform configuration layer
Tasks:
- manage company-specific settings
- manage industry profiles
- manage schema configs
- manage validation configs
- manage workflow configs

### 8. ERP/PIM and export support
Tasks:
- export trusted product records
- support integration-ready APIs
- generate commerce-ready output
- prepare data for downstream systems

### 9. Deployment
Tasks:
- create Docker setup
- deploy frontend and backend
- configure environment variables
- set up CI/CD
- add logging and monitoring
- keep the app stable for demo day

---

## Folder strategy

### `ai_ml/`
Contains all AI and ML code:
- parsing
- extraction
- validation
- confidence
- schema generation
- company discovery
- memory matrix
- opportunity intelligence

### `platform/`
Contains all application code:
- frontend
- backend
- APIs
- database
- auth
- orchestration
- deployment

### `shared/`
Contains contracts used by both sides:
- JSON schemas
- API contracts
- industry profile definitions
- validation configs
- constants
- prompt templates

The `shared/` folder should only change when both sides agree on an interface update.

---

## Git workflow

Recommended branches:
- `main`
- `ai-ml-dev`
- `fullstack-dev`
- `feature/*`

Rules:
- AI/ML engineer edits only `ai_ml/`
- Full stack engineer edits only `platform/`
- both can read `shared/`
- schema changes should be coordinated
- merge into `main` only after integration testing

---

## Demo flow

1. Upload a product PDF
2. System parses and extracts data
3. Bounding-box provenance highlights the source
4. Validation and confidence scoring run
5. Low-confidence fields enter review
6. Company/industry profile is detected
7. UI adapts to the company profile
8. Compatibility suggestions appear
9. Blank space opportunities are shown
10. Intent-based search returns reasoning
11. Trusted record is exported to ERP/PIM-ready format

---

## Key differentiators

- explainable AI
- bounding-box provenance
- adaptive company discovery
- industry profile engine
- dynamic schema generation
- dynamic validation engine
- dynamic UI renderer
- product memory
- industrial memory matrix
- compatibility intelligence
- blank space discovery
- opportunity intelligence
- intent-based industrial search
- commerce-ready product intelligence

---

## Deliverables

By the end of the hackathon, we want:
- a working upload pipeline
- a working extraction pipeline
- a working validation and review flow
- a dynamic UI that changes by industry profile
- a product intelligence dashboard
- a demo showing trusted record generation
- a clear roadmap for knowledge and commerce layers

---

## One-line pitch

An adaptive AI-powered Product Intelligence Platform that understands a company's domain, configures itself automatically, transforms scattered product information into trusted commerce-ready intelligence, continuously learns from human expertise, and scales across industries through configurable AI profiles.
