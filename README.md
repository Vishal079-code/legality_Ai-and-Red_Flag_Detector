# Legality AI Red Flag Detector

This application analyzes legal documents (PDFs) to detect red flags and risky clauses using AI-powered analysis. The frontend is built with React and Vite, while the backend runs on Google Colab using FastAPI.

## Prerequisites

- Node.js and npm installed on your system
- A Google account with access to Google Drive
- Google Colab access
- An ngrok account (create one at [ngrok.com](https://ngrok.com))

## Architecture

For detailed technical architecture, methodologies, and implementation details, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Setup Instructions

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install the required dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will typically run on `http://localhost:5173` (or another port if 5173 is occupied).

### Backend Setup

The backend runs on Google Colab. Follow these steps to set it up:

1. **Copy Required Directories to Google Drive:**
   - Copy the `app` directory from `backend/app`
   - Copy the `FAISS` directory from `backend/FAISS`
   - Move both directories into a newly created folder named `MyBackUp` in My Drive in your Google Drive

2. **Set up ngrok Authentication Token:**
   - Create an ngrok account at [ngrok.com](https://ngrok.com) if you haven't already
   - Get your ngrok auth token from the ngrok dashboard
   - In the Colab notebook, click on the key icon (🔑) in the left panel to open the Secrets section
   - Add a new secret with the variable name `NGROK_AUTH_TOKEN` and paste your ngrok auth token as the value and toggle to enable the notebook access of this secret key.

3. **Open the Colab Notebook:**
   - https://colab.research.google.com/drive/19kEiTkGAKQhmbz4ohfY7tFaHkdcW59N_?usp=sharing: `Save a copy in Drive` if required 
   - The notebook will mount your Google Drive and access the `app` and `FAISS` directories from the `MyBackUp` folder in My Drive.
   - All required Python dependencies will be automatically installed when you run the notebook cells
   - **Make Sure to use T4-GPU runtime**. 
4. **Run the Backend:**
   - Follow the instructions in the Colab notebook to start the FastAPI server
   - The notebook will provide you with an ngrok URL to access the backend API (e.g., `https://xxxx-xxxx-xxxx.ngrok-free.dev`)
   - **Copy this ngrok URL** - you'll need it for the frontend configuration

5. **Configure Frontend API URL:**
   - Open the file `frontend/src/services/api.js`
   - Find the line that defines `FASTAPI_BASE_URL` (around line 2):
     ```javascript
     const FASTAPI_BASE_URL = import.meta.env.VITE_FASTAPI_BASE_URL || 'https://kaleigh-unprovided-unreciprocally.ngrok-free.dev';
     ```
   - Replace the default ngrok URL (the part after `||`) with the ngrok URL you copied from the Colab notebook
   - For example, if your ngrok URL is `https://abc123.ngrok-free.dev`, update it to:
     ```javascript
     const FASTAPI_BASE_URL = import.meta.env.VITE_FASTAPI_BASE_URL || 'https://abc123.ngrok-free.dev';
     ```

## Test PDF

A test PDF file, **MEDALISTDIVERSIFIEDREIT%2CINC_05_18_2020-EX-10.1-CONSULTING%20AGREEMENT**, is provided in the root directory of this repository. You can use this file to test the application's functionality after setting up both the frontend and backend.

## Project Structure

```
legality_Ai-and-Red_Flag_Detector/
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
├── backend/           # FastAPI backend
│   ├── app/           # Main application code (copy to Google Drive)
│   ├── FAISS/         # FAISS index files (copy to Google Drive)
│   ├── data/          # Dataset files
│   └── requirements.txt
└── README.md
└── MEDALISTDIVERSIFIEDREIT%2CINC_05_18_2020-EX-10.1-CONSULTING%20AGREEMENT.PDF # Test file to upload
```

## Usage

1. Start the frontend development server (see Frontend Setup above)
2. Run the backend in Google Colab (see Backend Setup above)
3. Open the frontend URL in your browser (typically `http://localhost:5173`)
4. Upload a PDF document using the test PDF or any other legal document
5. View the analysis results, which include:
   - Document risk assessment
   - Identified risky clauses
   - Highlighted PDF with annotations

## Important Notes

- The backend requires the `app` and `FAISS` directories to be in your Google Drive under the `MyBackUp` folder in My Drive
- The FAISS directory contains pre-trained embeddings and index files needed for document analysis
- Make sure your Google Drive has sufficient storage space for the FAISS index files
- The Colab notebook will provide an ngrok URL that changes each time you restart the backend - you must update the URL in `frontend/src/services/api.js` each time you restart the backend
- Keep your ngrok auth token secure and never share it publicly

## Troubleshooting

- **Frontend won't start:** Make sure you've run `npm install` in the frontend directory
- **Backend connection errors:** Verify that the ngrok URL in your frontend configuration matches the one provided by Colab
- **Missing FAISS files:** Ensure both the `app` and `FAISS` directories are correctly copied to `MyBackUp` folder in My Drive in your Google Drive
- **ngrok authentication errors:** Verify that you've correctly added the `NGROK_AUTH_TOKEN` secret in Colab's Secrets section (left panel key icon)
