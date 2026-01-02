# Integration Guide

**Note:** The Python model integration has been moved to the `app/` directory, which contains a complete FastAPI implementation with ML-based analysis.

## Current Architecture

The `app/` directory contains:
- FastAPI service with ML models (embeddings, rerankers, FAISS)
- Complete document analysis pipeline
- PDF highlighting functionality
- Production-ready API endpoints

## Integration Options

### Option 1: Use app/ FastAPI Service Directly

The `app/` FastAPI service provides:
- `POST /analyze` - Analyze PDF documents
- `GET /highlight/{analysis_id}` - Download highlighted PDF

The backend should call these endpoints via HTTP instead of using local Python scripts.

### Option 2: Legacy Integration (Deprecated)

The following information is kept for reference only. The `backend/python/` directory has been removed.

**Previous integration steps (no longer applicable):**

### Update `load_model()`

```python
def load_model():
    """
    Load your trained model
    """
    # Example:
    # import pickle
    # with open('model.pkl', 'rb') as f:
    #     model = pickle.load(f)
    # return model
    
    # Or for TensorFlow/PyTorch:
    # import tensorflow as tf
    # model = tf.keras.models.load_model('model.h5')
    # return model
    
    return None  # Replace with your model
```

### Update `analyze_pdf()`

```python
def analyze_pdf(pdf_path, model=None):
    """
    Analyze PDF and return risks
    
    Must return:
    {
        "extractedText": "...",
        "risks": [
            {
                "text": "clause text",
                "level": "High|Medium|Low",
                "reason": "why it's risky",
                "category": "category name",
                "startIndex": 0,
                "endIndex": 50
            }
        ],
        "riskScore": 75
    }
    """
    # Your analysis code here
    # Use libraries like pdfplumber, PyPDF2, etc.
    
    # Example:
    # import pdfplumber
    # with pdfplumber.open(pdf_path) as pdf:
    #     text = ""
    #     for page in pdf.pages:
    #         text += page.extract_text()
    #
    # risks = your_model.predict(text)  # Your model inference
    # return format_results(text, risks)
    
    pass
```

### Update `generate_highlighted_pdf()`

```python
def generate_highlighted_pdf(pdf_path, output_path, analysis, model=None):
    """
    Generate PDF with highlighted risks
    
    Use libraries like:
    - PyPDF2 + reportlab (for annotations)
    - pdf-lib (Python equivalent)
    - pdfrw + reportlab
    """
    # Example using PyPDF2 and reportlab:
    # from PyPDF2 import PdfReader, PdfWriter
    # from reportlab.pdfgen import canvas
    # from reportlab.lib.colors import red, yellow, blue
    #
    # reader = PdfReader(pdf_path)
    # writer = PdfWriter()
    #
    # for page_num, page in enumerate(reader.pages):
    #     # Add highlights based on risks
    #     for risk in analysis['risks']:
    #         if risk['level'] == 'High':
    #             color = red
    #         elif risk['level'] == 'Medium':
    #             color = yellow
    #         else:
    #             color = blue
    #         # Highlight text at risk['startIndex'] to risk['endIndex']
    #
    # with open(output_path, 'wb') as f:
    #     writer.write(f)
    
    pass
```

## Step 3: Update Requirements (Deprecated)

Add your model's dependencies to `app/requirements.txt` (if modifying the FastAPI service):

```txt
# Your model dependencies
tensorflow>=2.13.0
# or
torch>=2.0.0
# or
scikit-learn>=1.3.0

# PDF processing
PyPDF2>=3.0.0
pdfplumber>=0.10.0
reportlab>=4.0.0
```

## Step 4: Store Original PDF Files

To generate PDF reports, you need to store the original PDF file. Update `backend/controllers/uploadController.js`:

```javascript
// Instead of deleting the file immediately, store it
const document = new Document({
  // ... other fields
  originalFilePath: filePath, // Keep the file path
});

await document.save();

// Optionally, move file to permanent storage instead of deleting
// const permanentPath = path.join(__dirname, '../storage', `${document._id}.pdf`);
// await fs.rename(filePath, permanentPath);
// document.originalFilePath = permanentPath;
// await document.save();
```

## Testing the Integration

### Test FastAPI Service Directly

```bash
cd app
# Start the FastAPI service
uvicorn main:app --reload

# Test analysis endpoint
curl -X POST "http://localhost:8000/analyze" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test.pdf"
```

### Test Through Backend API

1. Ensure FastAPI service is running (`app/`)
2. Upload a document: `POST /upload` (backend will need to forward to FastAPI)
3. Get analysis: `GET /analysis/:id`
4. Download report: `GET /report/:id` (or use FastAPI `/highlight/{analysis_id}`)

## Step 6: Error Handling

The backend will gracefully fall back if Python model fails. Ensure your Python script:

- Returns proper JSON for `--analyze_only`
- Creates the output file for PDF generation
- Handles errors gracefully
- Logs errors to stderr

## Example Model Output Format

Your `analyze_pdf()` function should return:

```python
{
    "extractedText": "Full text extracted from PDF...",
    "risks": [
        {
            "text": "The parties agree to binding arbitration...",
            "level": "High",
            "reason": "Contains binding arbitration clause",
            "category": "Dispute Resolution",
            "startIndex": 1234,
            "endIndex": 1280
        },
        {
            "text": "This agreement may be modified...",
            "level": "Medium",
            "reason": "Modification clause",
            "category": "Modification Rights",
            "startIndex": 2500,
            "endIndex": 2550
        }
    ],
    "riskScore": 65
}
```

## Troubleshooting

### FastAPI Service Not Running
- Start the FastAPI service: `cd app && uvicorn main:app`
- Check service is accessible at `http://localhost:8000`
- Verify CORS settings allow backend requests

### Model Loading Errors
- Check all dependencies in `app/requirements.txt` are installed
- Verify model file paths in `app/config.py`
- Check FAISS index and metadata files exist

### Integration Issues
- Ensure backend can make HTTP requests to FastAPI service
- Check API endpoint URLs match between services
- Verify response format matches expected schema
- Review CORS configuration if requests are blocked

