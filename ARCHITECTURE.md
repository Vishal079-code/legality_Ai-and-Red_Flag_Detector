# Architecture Overview

This document explains the technical architecture, methodologies, and implementation details of the Legality AI and Red Flag Detector system.

## System Architecture

The application follows a **client-server architecture** with a React frontend and a FastAPI backend:

- **Frontend**: React + Vite application providing the user interface
- **Backend**: FastAPI service running on Google Colab with ngrok tunneling
- **Communication**: RESTful API over HTTPS via ngrok tunnel

## Document Processing Pipeline

### 1. PDF Extraction
- **Primary Method**: `pdfplumber` for text extraction from embedded PDF text
- **Fallback Method**: OCR using `pytesseract` + `PyMuPDF` when extracted text is insufficient (< 200 chars)
- **Output**: Page-wise text with page numbers

### 2. Text Chunking
- **Regex-based segmentation**: Splits text on semicolons, periods, parentheses, and newlines
- **Legal exception handling**: Merges fragments starting with legal cues ("provided that", "except", "notwithstanding", etc.)
- **Clause packing**: Combines short fragments (< 40 chars) to form complete clauses
- **Deduplication**: Removes near-identical clauses using normalized text comparison

### 3. Clause Scoring (Multi-Label)

#### Embedding Generation
- **Model**: `BAAI/bge-large-en-v1.5` (SentenceTransformer)
- **Dual embeddings**: 
  - Primary: Direct clause embedding
  - Secondary: Context-prefixed embedding (`"CONTEXT:\n" + clause_text`)
- **Combined vector**: Concatenated primary + secondary embeddings for FAISS search

#### Retrieval & Reranking
- **FAISS Index**: Dense vector similarity search (top-25 candidates)
- **Sub-clause probing**: For long clauses (>240 chars), generates overlapping windows to improve retrieval recall
- **Reranker**: `BAAI/bge-reranker-large` cross-encoder model (top-10 after reranking)
- **Metadata lookup**: Retrieves label, answer text, and source information for matched clauses

#### Scoring Components
The final risk score combines three signals:

1. **Identity Score** (weight: 0.5)
   - Maximum cosine similarity against stored primary embeddings
   - Measures exact/near-exact clause matches

2. **Semantic Score** (weight: 0.4)
   - Maximum reranker score from top matches
   - Measures semantic similarity to known risky clauses

3. **Margin Score** (weight: 0.1)
   - Difference between top-1 and top-2 semantic scores
   - Measures confidence in the top match

**Final Score**: `0.5 × identity + 0.4 × semantic + 0.1 × margin`

### 4. Multi-Label Classification
- Each clause can map to multiple risk labels simultaneously
- Labels extracted from top matches: `non_compete`, `non_disclosure`, `termination_clause`, `uncapped_liability`, etc.
- Per-label semantic scores computed from matching metadata
- **Semantic gates**: Post-scoring filters (e.g., non-compete must contain restriction verbs + competition terms)

### 5. Risk Band Assignment
- **Threshold-based banding** per label:
  - `HIGH`: semantic_score ≥ high_threshold OR identity ≥ 0.98
  - `REVIEW`: low_threshold ≤ semantic_score < high_threshold
  - `LOW`: semantic_score < low_threshold
- **Label-specific thresholds**: Different thresholds for `non_compete`, `termination_for_convenience`, `uncapped_liability`
- Only clauses with `HIGH` or `REVIEW` bands are surfaced to users

### 6. Document-Level Aggregation
- **Per-label summary**: Max score, high-risk clause count, total clause count
- **Document risk**: `high_risk` if any label has high-risk clauses, else `low_risk`
- **Document score**: Average of all clause final scores × 10 (rounded)

## ML Models & Technologies

### Embedding Models
- **SentenceTransformer**: `BAAI/bge-large-en-v1.5`
  - Purpose: Generate dense vector representations of legal clauses
  - Output dimension: 1024 (primary) + 1024 (secondary) = 2048 combined

### Reranking Model
- **CrossEncoder**: `BAAI/bge-reranker-large`
  - Purpose: Fine-grained semantic similarity scoring
  - Input: Query-candidate text pairs
  - Output: Sigmoid-normalized similarity scores

### Vector Database
- **FAISS**: Facebook AI Similarity Search
  - Index type: Dense vector index (L2 or inner product)
  - Pre-computed embeddings: Stored in `primary_embs.npy`
  - Metadata: JSONL format with label, answer_text, source_title

### LLM Integration (Optional)
- **Google Gemini API**: `gemini-3-flash-preview`
  - Purpose: Offline LLM-based quality auditing for ambiguous clauses using **LANGFUSE**
  - Schema: Structured JSON output (relevant, risk_strength, suggested_band, confidence)
  - Used in: Judge evaluation pipeline for review-band clauses

## APIs & Services

### Backend API (FastAPI)
- **POST `/analyze`**: Document analysis endpoint
  - Input: PDF file (multipart/form-data)
  - Output: JSON with analysis results, document risk, clause details
- **GET `/highlight/{analysis_id}`**: Download highlighted PDF
- **GET `/health`**: Health check
- **GET `/ready`**: Readiness check (verifies models loaded)

### External Services
- **ngrok**: Secure tunneling for Colab backend exposure
- **Google Drive**: Storage for app code and FAISS index files
- **Google Colab**: Backend execution environment

## Frontend Architecture

### Technology Stack
- **React 18**: UI framework
- **Vite**: Build tool and dev server
- **React Router**: Client-side routing
- **Tailwind CSS**: Styling

### Key Components
- **UploadBox**: File upload with drag-and-drop
- **Analysis**: Results visualization with risk cards
- **PDF Highlighting**: Visual annotation of risky clauses

### State Management
- React hooks for local state
- API service layer (`api.js`) for backend communication

## Caching & Performance

- **Analysis Cache**: In-memory cache for analysis results (by analysis_id)
- **Batch Processing**: Clause scoring performed in batches (32 items)
- **GPU Acceleration**: Models run on GPU when available (CUDA)
- **Sub-clause Probing**: Only for long clauses to balance recall vs. performance

## Data Flow

```
PDF Upload
  ↓
PDF Extraction (pdfplumber/OCR)
  ↓
Text Chunking (regex + legal exception handling)
  ↓
Deduplication
  ↓
Batch Embedding (BGE-large)
  ↓
FAISS Retrieval (top-25)
  ↓
Sub-clause Probing (long clauses only)
  ↓
Cross-Encoder Reranking (top-10)
  ↓
Multi-Label Scoring (identity + semantic + margin)
  ↓
Risk Band Assignment (per label)
  ↓
Semantic Gates (post-filtering)
  ↓
Document Aggregation
  ↓
JSON Response + PDF Highlighting
```

## Key Design Decisions

1. **Dual Embeddings**: Primary + context-prefixed embeddings improve retrieval recall
2. **Sub-clause Probing**: Handles long legal clauses that may span multiple semantic units
3. **Multi-Label Support**: Single clause can map to multiple risk categories
4. **Semantic Gates**: Post-scoring filters reduce false positives (e.g., non-compete gate)
5. **Batch Processing**: Vectorized operations for efficient scoring
6. **OCR Fallback**: Ensures compatibility with scanned/image-based PDFs

## Configuration

Key parameters in `config.py`:
- `TOP_K_RETRIEVAL`: 25 (FAISS candidates)
- `TOP_K_RERANK`: 10 (final reranked results)
- `WEIGHTS`: Identity (0.5), Semantic (0.4), Margin (0.1)
- `RISK_THRESHOLDS`: Label-specific risk band thresholds
- `MIN_CLAUSE_LEN`: 40 characters
