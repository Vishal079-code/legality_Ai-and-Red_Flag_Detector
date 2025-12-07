# Legality AI Backend

Backend API server for the Legality AI Red Flag Detector application.

## Features

- File upload handling (PDF, DOCX, Images)
- OCR text extraction using Tesseract.js and pdf-parse
- AI-powered risk analysis and clause detection
- MongoDB storage for documents and analysis results
- RESTful API endpoints

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- Multer (file uploads)
- Tesseract.js (OCR)
- pdf-parse (PDF text extraction)
- mammoth (DOCX text extraction)

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
│   ├── ocr.js             # OCR and text extraction
│   └── analyzer.js        # Risk analysis logic
├── uploads/               # Temporary file storage
├── server.js              # Express app entry point
└── package.json
```

## Risk Analysis

The analyzer identifies risky clauses based on:

- **High Risk**: Liability waivers, indemnification, arbitration clauses, automatic renewals
- **Medium Risk**: Termination clauses, jurisdiction, modification rights
- **Low Risk**: Standard communication and boilerplate clauses

Risk score is calculated based on the number and severity of identified risks (0-100 scale).

## Notes

- Uploaded files are temporarily stored and deleted after processing
- OCR processing may take time for large images or scanned documents
- Ensure MongoDB is running before starting the server

