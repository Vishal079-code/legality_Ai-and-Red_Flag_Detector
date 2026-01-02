# Legality AI Backend

Backend API server for the Legality AI Red Flag Detector application.

## Features

- MongoDB storage for documents and analysis results (optional)
- RESTful API endpoints (health check, basic routes)
- **NO TEXT EXTRACTION OR PREPROCESSING** - All processing is done in app/ FastAPI service

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose (optional, for storage)
- Multer (file uploads - deprecated, use FastAPI directly)

## Important Notes

⚠️ **NO TEXT EXTRACTION OR PREPROCESSING IN BACKEND**

All document processing including:
- Text extraction (PDF, DOCX, images)
- OCR processing
- Document preprocessing
- Risk analysis
- PDF highlighting

**MUST be done in the `app/` FastAPI service only.**

The backend should NOT perform any text extraction, OCR, or preprocessing operations.

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your MongoDB connection string:
```
MONGODB_URI=mongodb://localhost:27017/legality-ai
PORT=5000
```

4. Make sure MongoDB is running on your system.

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### POST /upload
Upload a document for analysis.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: `file` (PDF, DOCX, JPG, PNG)
- Max file size: 10MB

**Response:**
```json
{
  "success": true,
  "documentId": "507f1f77bcf86cd799439011",
  "message": "Document uploaded and analyzed successfully"
}
```

### GET /analysis/:id
Get analysis results for a document.

**Response:**
```json
{
  "success": true,
  "extractedText": "Full extracted text...",
  "risks": [
    {
      "text": "Clause text...",
      "level": "High",
      "reason": "Contains high-risk liability waivers",
      "category": "Liability & Indemnification",
      "startIndex": 0,
      "endIndex": 50
    }
  ],
  "riskScore": 75,
  "documentId": "507f1f77bcf86cd799439011",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### GET /health
Health check endpoint.

## Project Structure

```
backend/
├── config/
│   └── db.js              # MongoDB connection
├── controllers/
│   ├── uploadController.js
│   └── analysisController.js
├── models/
│   └── Document.js        # Mongoose schema
├── routes/
│   ├── uploadRoutes.js
│   └── analysisRoutes.js
├── services/
│   └── (services removed - use app/ FastAPI service for analysis)
├── uploads/               # Temporary file storage
├── server.js              # Express app entry point
└── package.json
```

## Document Analysis

Document analysis is handled by the `app/` FastAPI service which provides:
- ML-based risk analysis using embeddings and rerankers
- Advanced PDF text extraction with OCR fallback
- Multi-label clause detection
- PDF highlighting with risk annotations

The backend should integrate with the FastAPI service at `/analyze` endpoint for document processing.

## Notes

⚠️ **CRITICAL: NO TEXT EXTRACTION OR PREPROCESSING IN BACKEND**

- All text extraction (PDF, DOCX, images) is done in `app/` FastAPI service
- All OCR processing is done in `app/` FastAPI service  
- All document preprocessing is done in `app/` FastAPI service
- Backend should NOT perform any document processing operations
- Frontend should call FastAPI service directly at `/analyze` endpoint
- Backend routes are kept for backward compatibility only


