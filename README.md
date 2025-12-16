# Legality AI Red Flag Detector

A complete full-stack application for detecting risky clauses and potential legal issues in documents using AI analysis.

## Project Structure

```
legality-ai-red-flag-detector/
├── frontend/          # React + Vite + Tailwind frontend
├── backend/           # Node.js + Express backend
│   ├── python/        # Python model service (Jupyter notebook integration)
│   ├── config/        # Database configuration
│   ├── controllers/   # Route controllers
│   ├── models/        # Mongoose models
│   ├── routes/        # API routes
│   └── services/      # Business logic services
└── README.md
```

## Features

- **Frontend**: Modern React UI with drag-and-drop file upload
- **Backend**: Express API with MongoDB storage
- **OCR**: Text extraction from PDFs, images, and DOCX files
- **AI Analysis**: Risk detection and clause highlighting
- **PDF Reports**: Generated reports with highlighted risks (via Python model)

## Quick Start

### Prerequisites

- Node.js (v18+)
- MongoDB (local or Atlas)
- Python 3.8+ (for model service)
- npm or yarn

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` (Vite default)

### Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your MongoDB URI

npm start
```

Backend runs on `http://localhost:5000`

### Python Model Service Setup

```bash
cd backend/python
pip install -r requirements.txt

# Integrate your Jupyter notebook model
# Edit model_service.py with your model code
```

## Integration Guide

### Integrating Your Jupyter Notebook Model

1. **Copy your model code** from the Jupyter notebook to `backend/python/model_service.py`

2. **Update the functions**:
   - `load_model()` - Load your trained model
   - `analyze_pdf()` - Your PDF analysis logic
   - `generate_highlighted_pdf()` - Your PDF highlighting logic

3. **Ensure output format** matches:
   ```python
   {
       "extractedText": "...",
       "risks": [...],
       "riskScore": 75
   }
   ```

4. **Test the Python service**:
   ```bash
   python backend/python/model_service.py --input test.pdf --analyze_only
   ```

## API Endpoints

- `POST /upload` - Upload document for analysis
- `GET /analysis/:id` - Get analysis results
- `GET /report/:id` - Download PDF report with highlights
- `GET /health` - Health check

## Deployment

### Frontend Deployment

Build for production:
```bash
cd frontend
npm run build
```

Deploy the `dist/` folder to your hosting service (Vercel, Netlify, etc.)

### Backend Deployment

1. Set environment variables:
   - `MONGODB_URI`
   - `PORT`
   - `NODE_ENV=production`

2. Deploy to your server (Heroku, AWS, DigitalOcean, etc.)

3. Ensure Python is available on the server for model service

### Python Model Service

Ensure Python dependencies are installed on the server:
```bash
pip install -r backend/python/requirements.txt
```

## Development

### Running Both Services

**Terminal 1 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
```

## Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/legality-ai
PORT=5000
NODE_ENV=development
```

### Frontend
Update `frontend/src/services/api.js` with your backend URL:
```javascript
const API_BASE_URL = 'http://localhost:5000';
```

## Troubleshooting

- **MongoDB Connection**: Ensure MongoDB is running
- **Python Model**: Check Python path and dependencies
- **File Upload**: Check file size limits (10MB default)
- **CORS Errors**: Backend CORS is enabled for localhost

## License

ISC
