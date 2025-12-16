# Python Model Service

This directory contains the Python service that integrates your Jupyter notebook model with the Node.js backend.

## Setup

1. **Install Python dependencies:**
```bash
cd backend/python
pip install -r requirements.txt
```

2. **Integrate your Jupyter notebook model:**
   - Copy your model code from the Jupyter notebook
   - Update `model_service.py` with your actual model loading and inference code
   - Replace placeholder functions with your implementation:
     - `load_model()` - Load your trained model
     - `analyze_pdf()` - Your PDF analysis logic
     - `generate_highlighted_pdf()` - Your PDF highlighting logic

## Usage

The service is called automatically by the Node.js backend, but you can test it directly:

**Analyze only:**
```bash
python model_service.py --input /path/to/document.pdf --analyze_only
```

**Generate report:**
```bash
python model_service.py --input /path/to/document.pdf --output /path/to/report.pdf --document_id abc123
```

## Integration Steps

1. **Copy your model code:**
   - Extract the relevant cells from your Jupyter notebook
   - Add them to `model_service.py` in the appropriate functions

2. **Update function signatures:**
   - Ensure `analyze_pdf()` returns a dict with: `extractedText`, `risks[]`, `riskScore`
   - Ensure `generate_highlighted_pdf()` creates a PDF with highlighted risks

3. **Test the integration:**
   - Test the Python script directly first
   - Then test through the Node.js API endpoints

## Model Output Format

Your `analyze_pdf()` function should return:
```python
{
    "extractedText": "Full text from PDF...",
    "risks": [
        {
            "text": "Risky clause text",
            "level": "High|Medium|Low",
            "reason": "Why it's risky",
            "category": "Category name",
            "startIndex": 0,
            "endIndex": 50
        }
    ],
    "riskScore": 75  # 0-100
}
```

## PDF Highlighting

Your `generate_highlighted_pdf()` function should:
- Read the input PDF
- Highlight risky clauses based on the analysis
- Save the highlighted PDF to the output path
- Use different colors for High/Medium/Low risks

