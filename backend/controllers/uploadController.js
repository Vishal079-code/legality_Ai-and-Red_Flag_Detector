import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { extractText } from '../services/ocr.js';
import { analyzeText } from '../services/analyzer.js';
import Document from '../models/Document.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
fs.mkdir(uploadsDir, { recursive: true }).catch(console.error);

/**
 * Handle file upload, OCR, and analysis
 */
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const filePath = req.file.path;
    const mimeType = req.file.mimetype;
    const fileName = req.file.originalname;

    console.log(`Processing file: ${fileName}, Type: ${mimeType}`);

    // Extract text using OCR
    let extractedText;
    try {
      extractedText = await extractText(filePath, mimeType);
      
      if (!extractedText || extractedText.trim().length === 0) {
        // Clean up uploaded file
        await fs.unlink(filePath);
        
        return res.status(400).json({
          success: false,
          message: 'Could not extract text from the document. Please ensure the document contains readable text.',
        });
      }
    } catch (ocrError) {
      // Clean up uploaded file
      await fs.unlink(filePath).catch(console.error);
      
      console.error('OCR Error:', ocrError);
      return res.status(500).json({
        success: false,
        message: 'Error extracting text from document',
        error: ocrError.message,
      });
    }

    // Analyze the extracted text
    const { clauses, riskScore } = analyzeText(extractedText);

    // Save to database
    const document = new Document({
      text: extractedText,
      clauses,
      riskScore,
      fileName,
      fileType: mimeType,
    });

    await document.save();

    // Clean up uploaded file after processing
    await fs.unlink(filePath).catch(console.error);

    console.log(`Document processed successfully. ID: ${document._id}, Risks found: ${clauses.length}`);

    res.status(200).json({
      success: true,
      documentId: document._id.toString(),
      message: 'Document uploaded and analyzed successfully',
    });
  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up uploaded file if it exists
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(console.error);
    }

    res.status(500).json({
      success: false,
      message: 'Error processing document',
      error: error.message,
    });
  }
};

