# Project Structure

## Complete Directory Layout

```
legality-ai-red-flag-detector/
│
├── frontend/                          # React Frontend Application
│   ├── src/
│   │   ├── components/               # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── UploadBox.jsx
│   │   │   ├── Loader.jsx
│   │   │   ├── ClauseHighlighter.jsx
│   │   │   └── RiskCard.jsx
│   │   ├── pages/                    # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Upload.jsx
│   │   │   └── Analysis.jsx
│   │   ├── services/                 # API service functions
│   │   │   └── api.js
│   │   ├── App.jsx                   # Main app component
│   │   ├── main.jsx                  # Entry point
│   │   └── index.css                 # Tailwind CSS
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── README.md
│
├── backend/                           # Node.js Backend API
│   ├── config/
│   │   └── db.js                     # MongoDB connection
│   │
│   ├── controllers/                  # Route controllers
│   │   ├── uploadController.js       # Handle file uploads
│   │   ├── analysisController.js     # Get analysis results
│   │   └── reportController.js       # Generate PDF reports
│   │
│   ├── models/                       # Mongoose models
│   │   └── Document.js               # Document schema
│   │
│   ├── routes/                       # API routes
│   │   ├── uploadRoutes.js           # POST /upload
│   │   └── analysisRoutes.js         # GET /analysis/:id, GET /report/:id
│   │
│   ├── services/                     # Business logic
│   │   ├── ocr.js                    # Text extraction (Tesseract, pdf-parse)
│   │   ├── analyzer.js               # Risk analysis logic
│   │   └── pythonService.js          # Python model integration
│   │
│   ├── python/                       # Python Model Service
│   │   ├── model_service.py          # Main Python service (integrate your Jupyter model here)
│   │   ├── requirements.txt          # Python dependencies
│   │   └── README.md                 # Python integration guide
│   │
│   ├── uploads/                      # Temporary upload storage
│   ├── storage/                      # Permanent PDF storage (for reports)
│   ├── reports/                      # Generated PDF reports
│   │
│   ├── server.js                     # Express app entry point
│   ├── package.json
│   ├── .env.example
│   ├── .gitignore
│   ├── README.md
│   ├── QUICKSTART.md
│   └── INTEGRATION_GUIDE.md          # Python model integration guide
│
├── README.md                          # Main project README
├── DEPLOYMENT.md                      # Deployment guide
└── PROJECT_STRUCTURE.md               # This file

```

## Key Files

### Frontend
- **`frontend/src/services/api.js`** - API client (update API_BASE_URL for production)
- **`frontend/src/App.jsx`** - Main app with routing
- **`frontend/package.json`** - Frontend dependencies

### Backend
- **`backend/server.js`** - Express server setup
- **`backend/controllers/uploadController.js`** - File upload handler
- **`backend/controllers/reportController.js`** - PDF report generation
- **`backend/services/pythonService.js`** - Python model bridge
- **`backend/python/model_service.py`** - **INTEGRATE YOUR JUPYTER MODEL HERE**

### Configuration
- **`backend/.env`** - Environment variables (create from .env.example)
- **`backend/config/db.js`** - MongoDB connection

## API Endpoints

- `POST /upload` - Upload document
- `GET /analysis/:id` - Get analysis results
- `GET /report/:id` - Download PDF report
- `GET /health` - Health check

## Integration Points

### Python Model Integration
1. Copy your Jupyter notebook code to `backend/python/model_service.py`
2. Update `load_model()`, `analyze_pdf()`, and `generate_highlighted_pdf()` functions
3. Install Python dependencies: `pip install -r backend/python/requirements.txt`
4. Test: `python backend/python/model_service.py --input test.pdf --analyze_only`

### Frontend-Backend Connection
- Frontend API URL: `frontend/src/services/api.js`
- Backend CORS: Configured in `backend/server.js`

## File Flow

1. **Upload**: User uploads file → `uploads/` → OCR extraction → Analysis → MongoDB
2. **Analysis**: Fetch from MongoDB → Return to frontend
3. **Report**: Fetch PDF from `storage/` → Python model generates highlighted PDF → Save to `reports/` → Download

## Next Steps

1. **Integrate your Jupyter model** - See `backend/INTEGRATION_GUIDE.md`
2. **Set up MongoDB** - Local or MongoDB Atlas
3. **Configure environment** - Copy `.env.example` to `.env`
4. **Deploy** - See `DEPLOYMENT.md`

