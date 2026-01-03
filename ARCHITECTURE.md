# Complete Context, Logic, and Architecture of the `app/` Directory

## Overview

The `app/` directory is a **FastAPI service** for analyzing legal documents and detecting risky clauses. It uses ML models (embeddings, rerankers, FAISS) to identify and score legal risks in PDF documents.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    FastAPI Application (main.py)            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   /analyze   │  │  /highlight  │  │   /health    │     │
│  │   (POST)     │  │  /{id} (GET) │  │   /ready     │     │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘     │
└─────────┼──────────────────┼────────────────────────────────┘
          │                  │
          ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    Processing Pipeline                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ document_io │→ │  chunking    │→ │   scoring    │      │
│  │ (extract)   │  │  (segment)   │  │  (ML models) │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                            ▼                                 │
│                    ┌──────────────┐                          │
│                    │   pipeline   │                          │
│                    │ (orchestrate)│                          │
│                    └──────────────┘                          │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                    ML Models & Data                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ embed_model  │  │   reranker   │  │  FAISS index │      │
│  │ (BGE-large) │  │ (BGE-rerank) │  │  + metadata  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## File-by-File Breakdown

### 1. `main.py` - FastAPI Application Entry Point

**Purpose**: FastAPI application with endpoints, middleware, and error handling.

**Key Components**:
- **Lifespan management**: Loads ML models on startup via `models.initialize_models()`
- **CORS middleware**: Configurable via `config.py`
- **Request logging**: Logs all HTTP requests with timing
- **Exception handlers**: Custom exceptions with appropriate HTTP status codes

**Endpoints**:

1. **`POST /analyze`** - Main analysis endpoint
   - Accepts PDF file upload
   - Validates file (size, extension)
   - Calls `analyze_document()` from pipeline
   - Caches result with `analysis_id`
   - Returns: `{analysis_id, document_risk, label_summary, clauses}`

2. **`GET /highlight/{analysis_id}`** - PDF highlighting endpoint
   - Retrieves cached analysis
   - Generates highlighted PDF using `pdf_highlight.py`
   - Returns PDF as streaming response with `Content-Disposition: attachment`

3. **`GET /health`** - Basic health check
4. **`GET /ready`** - Readiness check (verifies models loaded)
5. **`GET /`** - Root endpoint with API info

**Dependencies**:
- `app.models` - ML model initialization
- `app.pipeline` - Document analysis pipeline
- `app.analysis_cache` - Caching system
- `app.pdf_highlight` - PDF highlighting
- `app.schemas` - Pydantic validation models
- `app.exceptions` - Custom exceptions
- `app.config` - Configuration constants

---

### 2. `config.py` - Configuration Management

**Purpose**: Centralized configuration via environment variables with defaults.

**Key Configuration Sections**:

**Model Configuration**:
- `EMBED_MODEL_NAME`: Default `"BAAI/bge-large-en-v1.5"`
- `RERANKER_MODEL_NAME`: Default `"BAAI/bge-reranker-large"`
- `USE_GPU`: Boolean flag for GPU usage

**Vector DB Paths**:
- `FAISS_INDEX_PATH`: Path to FAISS index file
- `METADATA_PATH`: Path to metadata JSONL file
- `PRIMARY_EMBS_PATH`: Path to primary embeddings numpy file

**Retrieval Configuration**:
- `TOP_K_RETRIEVAL`: 25 (FAISS candidates)
- `TOP_K_RERANK`: 10 (reranked candidates)
- `RERANKER_BATCH_SIZE`: 32

**Scoring Weights**:
```python
WEIGHTS = {
    "identity": 0.5,   # Exact match score
    "semantic": 0.4,   # Semantic similarity score
    "margin": 0.1      # Margin between top-1 and top-2
}
```

**Risk Thresholds**:
- Per-label thresholds for LOW/REVIEW/HIGH bands
- Default: `(0.60, 0.70)` for unknown labels

**API Configuration**:
- CORS settings (origins, methods, headers)
- `MAX_FILE_SIZE_MB`: 50MB default
- `LOG_LEVEL`: INFO default

---

### 3. `schemas.py` - Pydantic Data Models

**Purpose**: Request/response validation and API documentation.

**Key Models**:

`DocumentAnalysisResponse`:
```python
{
    "analysis_id": str,
    "document_risk": str,  # "low_risk", "high_risk"
    "label_summary": Dict[str, LabelSummary],
    "clauses": List[ClauseResult]
}
```

`ClauseResult`:
```python
{
    "page_no": int,
    "clause_text": str,
    "labels": List[LabelRisk],
    "identity": float,
    "semantic": float,
    "margin": float,
    "top_matches": List[Dict]
}
```

`LabelRisk`:
```python
{
    "label": str,
    "semantic_score": float,
    "final_score": float,
    "band": str  # "low", "review", "high"
}
```

---

### 4. `pipeline.py` - Main Processing Pipeline

**Purpose**: Orchestrates document analysis from PDF bytes to risk assessment.

**Processing Flow**:

1. **Extract pages** (`document_io.extract_pages_from_pdf_bytes`)
   - Returns: `[{"page_no": int, "text": str}, ...]`

2. **Chunk pages** (`chunking.chunk_pages`)
   - Splits text into semantic clauses
   - Handles legal exception phrases
   - Returns: `[{"page_no": int, "clause_text": str}, ...]`

3. **Deduplicate chunks** (`chunking.deduplicate_chunks`)
   - Removes duplicate clauses

4. **Analyze clauses** (`analyze_clauses`)
   - Batch scores all clauses
   - Extracts multi-label signals
   - Filters by risk bands (removes LOW risk)
   - Applies semantic gates (e.g., non-compete validation)
   - Deduplicates/merges similar clauses

5. **Aggregate document risk** (`aggregate_document_risk`)
   - Computes per-label summaries
   - Determines overall document risk level

**Key Functions**:

`analyze_clauses(chunks, dedup=True)`:
- Batch scores clauses using `scoring.score_clauses_batch()`
- Extracts labels from top matches
- Applies semantic gates (e.g., non-compete must have restriction verbs + competition terms)
- Filters to only risky labels (band != LOW)
- Optionally deduplicates similar clauses

`assign_label_band(semantic_score, identity, label)`:
- Assigns LOW/REVIEW/HIGH based on thresholds
- Identity >= 0.98 → HIGH
- Uses label-specific thresholds from config

`extract_clause_labels(score_out)`:
- Converts `top_matches` into per-label risk assessments
- Computes weighted final score: `identity * 0.5 + semantic * 0.4 + margin * 0.1`
- Assigns risk bands per label

---

### 5. `document_io.py` - PDF Text Extraction

**Purpose**: Extracts text from PDF files with OCR fallback.

**Extraction Strategy**:

1. **Primary**: `pdfplumber` (embedded text)
   - Fast, accurate for text-based PDFs
   - Extracts page-by-page text

2. **Fallback**: OCR (`pytesseract` + `PyMuPDF`)
   - Used if extracted text < `OCR_MIN_CHARS` (200 chars)
   - Renders PDF pages to images at `OCR_RESOLUTION` DPI (300)
   - Runs OCR with `--oem 3 --psm 6`
   - Normalizes OCR text (fixes hyphenation, line breaks, whitespace)

**Key Functions**:

`extract_pages_from_pdf_bytes(pdf_bytes)`:
- Main entry point
- Returns: `[{"page_no": int, "text": str}, ...]`
- Automatically falls back to OCR if needed

`normalize_ocr_text(text)`:
- Fixes hyphenated line breaks: `"com-\npetition"` → `"competition"`
- Normalizes line endings
- Collapses single newlines within paragraphs
- Normalizes whitespace

---

### 6. `chunking.py` - Text Segmentation

**Purpose**: Splits document text into semantic legal clauses.

**Chunking Strategy**:

1. **Split by delimiters**:
   - Semicolons (`;`)
   - Periods (`.`)
   - Closing parentheses followed by capital letters: `(?<=\))(?=\s+[A-Z])`
   - Newlines

2. **Merge legal exceptions**:
   - Detects exception phrases: "provided that", "except", "unless", "subject to", "notwithstanding", "so long as", "however", "including"
   - Merges fragments that start with exception cues
   - Handles backward-aware forward binding

3. **Pack short clauses**:
   - Clauses < `MIN_CLAUSE_LEN` (40 chars) are accumulated
   - Never merges two independent long clauses

4. **Deduplication**:
   - Removes duplicate clauses (normalized text comparison)

**Key Functions**:

`chunk_page_text(text, page_no)`:
- Splits text into raw clauses
- Merges exception fragments
- Packs short clauses
- Returns: `[{"page_no": int, "clause_text": str}, ...]`

`chunk_pages(pages)`:
- Processes all pages
- Returns combined list of chunks

`deduplicate_chunks(chunks)`:
- Removes duplicates based on normalized text

---

### 7. `scoring.py` - ML-Based Risk Scoring

**Purpose**: Scores clauses using embeddings, FAISS retrieval, and reranking.

**Scoring Pipeline**:

1. **Embedding**:
   - Primary: `embed_model.encode(text)`
   - Secondary: `embed_model.encode("CONTEXT:\n" + text)`
   - Combined: Concatenated `[primary, secondary]` (2x dimension)

2. **Identity Score**:
   - Max cosine similarity against stored `primary_embs`
   - Measures exact/near-exact match

3. **Semantic Retrieval**:
   - FAISS search with combined embedding
   - Retrieves top `TOP_K_RETRIEVAL` (25) candidates
   - For long clauses: sub-clause probing (sliding windows)

4. **Reranking**:
   - Cross-encoder reranker on query-candidate pairs
   - Sigmoid activation: `expit(raw_scores)`
   - Top `TOP_K_RERANK` (10) matches kept

5. **Margin Score**:
   - `top1_score - top2_score`
   - Measures confidence in top match

6. **Final Score**:
   ```python
   final_score = (
       0.5 * identity +
       0.4 * max(semantic_scores) +
       0.1 * margin
   )
   ```

**Key Functions**:

`score_clause(text)` - Single clause scoring:
- Full pipeline for one clause
- Returns: `{final_score, identity, semantic, margin, top_matches}`

`score_clauses_batch(texts)` - Batch scoring:
- Vectorized batch processing
- Sub-clause probing for long clauses
- Batched reranking
- Returns: `List[dict]` matching `score_clause` format

`embed_clause(text)`:
- Creates dual embedding (primary + context-prefixed)
- Returns combined vector

---

### 8. `models.py` - ML Model Management

**Purpose**: Loads and manages ML models, FAISS index, and metadata.

**Models Loaded**:

1. **Embedding Model** (`embed_model`):
   - `SentenceTransformer(EMBED_MODEL_NAME)`
   - Default: `"BAAI/bge-large-en-v1.5"`
   - GPU/CPU based on `USE_GPU` config

2. **Reranker** (`reranker`):
   - `CrossEncoder(RERANKER_MODEL_NAME)`
   - Default: `"BAAI/bge-reranker-large"`
   - GPU/CPU based on `USE_GPU` config

3. **FAISS Index** (`faiss_index`):
   - Loaded from `FAISS_INDEX_PATH`
   - Used for dense vector similarity search

4. **Metadata** (`metadata`):
   - JSONL file with label, answer_text, source_title
   - Label normalization (lowercase, underscores)
   - One record per reference clause

5. **Primary Embeddings** (`primary_embs`):
   - NumPy array of primary embeddings
   - Used for identity score computation
   - Must match metadata length

**Initialization**:

`initialize_models()`:
- Loads all models in sequence
- Performs sanity checks
- Raises `RuntimeError` if any model fails to load
- Called during FastAPI startup (lifespan)

**Global State**:
- All models stored as module-level globals
- Accessed by `scoring.py` and other modules
- Thread-safe (models are read-only after initialization)

---

### 9. `pdf_highlight.py` - PDF Highlighting

**Purpose**: Generates highlighted PDFs with risky clauses marked.

**Functionality**:

`highlight_clauses_in_pdf(pdf_bytes, clauses)`:
- Opens PDF using PyMuPDF (`fitz`)
- For each clause:
  - Finds page by `page_no`
  - Searches for clause text on page
  - Falls back to first 200 chars if exact match fails
  - Adds highlight annotation
- Returns highlighted PDF as bytes

**Highlighting Strategy**:
- Uses PyMuPDF's `add_highlight_annot()`
- Sets annotation title: "Legality-AI"
- Sets annotation content: "Detected risky clause"
- Multiple matches per clause are all highlighted

---

### 10. `analysis_cache.py` - In-Memory Caching

**Purpose**: Caches analysis results for PDF highlighting.

**Cache Structure**:
```python
{
    "analysis_id": {
        "pdf_bytes": bytes,
        "result": Dict[str, Any],  # Full analysis result
        "expires_at": float  # Unix timestamp
    }
}
```

**Key Functions**:

`create_analysis_entry(pdf_bytes, analysis_result, ttl_seconds=900)`:
- Generates UUID `analysis_id`
- Stores PDF bytes + analysis result
- Sets expiration (default 15 minutes)
- Returns `analysis_id`

`get_analysis_entry(analysis_id)`:
- Retrieves cached entry if valid
- Returns `None` if expired or not found
- Auto-cleans expired entries

**Thread Safety**:
- Uses `threading.Lock()` for concurrent access
- Thread-safe for multi-request scenarios

---

### 11. `exceptions.py` - Custom Exceptions

**Purpose**: Custom exception hierarchy for error handling.

**Exception Classes**:

- `LegalityAIException` - Base exception
- `ModelNotLoadedError` - Models not initialized (503)
- `InvalidFileError` - File validation failed (400)
- `FileProcessingError` - Processing error (422)
- `ConfigurationError` - Config error

**Used by**:
- `main.py` exception handlers
- Automatic HTTP status code mapping
- Consistent error response format

---

## Data Flow: Complete Request Lifecycle

```
1. User uploads PDF → POST /analyze
   │
   ├─→ File validation (size, extension)
   │
   ├─→ document_io.extract_pages_from_pdf_bytes()
   │   ├─→ Try pdfplumber (embedded text)
   │   └─→ Fallback to OCR if needed
   │
   ├─→ chunking.chunk_pages()
   │   ├─→ Split by delimiters (;, ., newlines)
   │   ├─→ Merge exception phrases
   │   └─→ Pack short clauses
   │
   ├─→ chunking.deduplicate_chunks()
   │
   ├─→ pipeline.analyze_clauses()
   │   ├─→ scoring.score_clauses_batch()
   │   │   ├─→ Embed clauses (primary + secondary)
   │   │   ├─→ FAISS retrieval (top 25)
   │   │   ├─→ Rerank (top 10)
   │   │   └─→ Compute identity, semantic, margin
   │   ├─→ Extract multi-label signals
   │   ├─→ Apply semantic gates
   │   └─→ Filter to risky labels only
   │
   ├─→ pipeline.aggregate_document_risk()
   │   └─→ Compute document-level summary
   │
   ├─→ analysis_cache.create_analysis_entry()
   │   └─→ Cache PDF + result → analysis_id
   │
   └─→ Return {analysis_id, document_risk, label_summary, clauses}

2. User requests highlighted PDF → GET /highlight/{analysis_id}
   │
   ├─→ analysis_cache.get_analysis_entry(analysis_id)
   │
   ├─→ pdf_highlight.highlight_clauses_in_pdf()
   │   └─→ Add highlight annotations to PDF
   │
   └─→ Return PDF as streaming response
```

---

## Key Design Patterns

1. **Multi-label risk detection**:
   - Each clause can have multiple risk labels
   - Per-label scoring and banding
   - Document-level aggregation across labels

2. **Semantic gates**:
   - Post-scoring validation (e.g., non-compete must have restriction verbs + competition terms)
   - Reduces false positives

3. **Batch processing**:
   - Vectorized embeddings and reranking
   - Sub-clause probing for long clauses
   - Efficient for large documents

4. **Caching strategy**:
   - In-memory cache with TTL
   - Enables PDF highlighting without re-analysis
   - Thread-safe implementation

5. **Fallback mechanisms**:
   - OCR fallback for scanned PDFs
   - Partial text matching for PDF highlighting
   - Default thresholds for unknown labels

---

## Dependencies

**Core Libraries**:
- `fastapi` - Web framework
- `sentence-transformers` - Embedding models
- `faiss-cpu` / `faiss-gpu` - Vector similarity search
- `PyMuPDF` (fitz) - PDF manipulation
- `pdfplumber` - PDF text extraction
- `pytesseract` - OCR
- `PIL` (Pillow) - Image processing
- `numpy` - Numerical operations
- `scipy` - Sigmoid function
- `pydantic` - Data validation

---

## Configuration Requirements

**Required Files** (in `FAISS_DIR`):
- `clauses.index` - FAISS index file
- `metadata.jsonl` - Reference clauses metadata
- `primary_embs.npy` - Primary embeddings array

**Environment Variables**:
- `EMBED_MODEL_NAME` - Embedding model (optional)
- `RERANKER_MODEL_NAME` - Reranker model (optional)
- `FAISS_DIR` - Directory containing FAISS files
- `USE_GPU` - Enable GPU (true/false)
- `CORS_ORIGINS` - Allowed origins (comma-separated)
- `MAX_FILE_SIZE_MB` - Max upload size
- `LOG_LEVEL` - Logging level

---

## Performance Considerations

1. **Model loading**:
   - Models loaded once at startup
   - Stored as global variables
   - GPU acceleration if available

2. **Batch processing**:
   - Clauses scored in batches
   - Vectorized operations where possible
   - Reranker batch size: 32

3. **Caching**:
   - Analysis results cached for 15 minutes
   - Enables fast PDF highlighting

4. **Memory management**:
   - PDF bytes kept in memory during processing
   - Cached for TTL duration
   - Thread-safe cleanup

---

## Error Handling

1. **Model initialization**:
   - Fails fast if models don't load
   - Clear error messages
   - Startup validation

2. **File processing**:
   - Validation before processing
   - Graceful OCR fallback
   - Detailed error messages

3. **API errors**:
   - Custom exceptions with appropriate HTTP codes
   - Consistent error response format
   - Request logging for debugging

---

## Summary

This architecture provides a production-ready legal document analysis system with ML-based risk detection, multi-label classification, and PDF highlighting capabilities. The system is designed for scalability, maintainability, and accuracy in identifying risky legal clauses.

