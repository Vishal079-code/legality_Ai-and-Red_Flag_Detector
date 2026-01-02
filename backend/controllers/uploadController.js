import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
// Note: OCR and analysis services removed - use app/ FastAPI service instead
import Document from '../models/Document.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
fs.mkdir(uploadsDir, { recursive: true }).catch(console.error);

/**
 * Handle file upload - NO TEXT EXTRACTION OR PREPROCESSING
 * All text extraction, preprocessing, and analysis is done in app/ FastAPI service
 * This endpoint is kept for backward compatibility but should not be used
 * Frontend should call FastAPI service directly at /analyze endpoint
 */
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    // Clean up uploaded file immediately - no processing done here
    const filePath = req.file.path;
    await fs.unlink(filePath).catch(console.error);

    // Return error directing to use FastAPI service
    return res.status(503).json({
      success: false,
      message: 'This endpoint is deprecated. All document processing (text extraction, preprocessing, analysis) is handled by the app/ FastAPI service.',
      hint: 'Use the FastAPI /analyze endpoint directly from the frontend. No text extraction or preprocessing is done in the backend.',
      fastapiEndpoint: '/analyze',
    });
  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up uploaded file if it exists
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(console.error);
    }

    res.status(500).json({
      success: false,
      message: 'Error handling upload',
      error: error.message,
    });
  }
};


