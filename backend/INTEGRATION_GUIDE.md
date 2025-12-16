# Python Model Integration Guide

This guide explains how to integrate your Jupyter notebook model into the backend.

## Step 1: Prepare Your Model Code

Extract the relevant code from your Jupyter notebook:

1. **Model Loading Code** - How you load your trained model
2. **PDF Analysis Code** - How you analyze PDFs and extract risks
3. **PDF Highlighting Code** - How you generate PDFs with highlighted risks

## Step 2: Update model_service.py

Edit `backend/python/model_service.py` and replace the placeholder functions:

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

## Step 3: Update Requirements

Add your model's dependencies to `backend/python/requirements.txt`:

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

## Step 5: Test Your Integration

### Test Python Script Directly

```bash
cd backend/python
python model_service.py --input test.pdf --analyze_only
```

### Test PDF Generation

```bash
python model_service.py --input test.pdf --output report.pdf --document_id test123
```

### Test Through API

1. Upload a document: `POST /upload`
2. Get analysis: `GET /analysis/:id`
3. Download report: `GET /report/:id`

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

### Python Not Found
- Ensure Python is in your PATH
- Use `python3` instead of `python` if needed
- Update `pythonService.js` to use correct Python command

### Model Import Errors
- Check all dependencies are installed
- Verify model file paths
- Add model directory to Python path

### PDF Generation Fails
- Check file permissions
- Verify output directory exists
- Ensure PDF libraries are installed

### Integration Issues
- Check Python script output format matches expected JSON
- Verify file paths are correct
- Check Node.js can spawn Python processes

