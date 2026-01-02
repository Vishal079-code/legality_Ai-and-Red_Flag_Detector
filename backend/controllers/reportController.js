import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import Document from '../models/Document.js';
// Note: pythonService removed - use app/ FastAPI service instead

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate and download PDF report
 * Note: PDF highlighting is done in app/ directory only
 */
export const downloadPDFReport = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Document ID is required',
      });
    }

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    const reportsDir = path.join(__dirname, '../reports');
    const reportPath = path.join(reportsDir, `report-${id}.pdf`);

    // Check if report already exists
    try {
      await fs.access(reportPath);
      // Report exists, send it
      return sendPDFReport(res, reportPath, id);
    } catch {
      // Report doesn't exist, generate it
    }

    // TODO: Integrate with app/ FastAPI service for PDF highlighting
    // The app/ directory contains the complete PDF highlighting implementation
    // This should call the FastAPI service at /highlight/{analysis_id} endpoint
    
    return res.status(503).json({
      success: false,
      message: 'PDF report generation requires integration with app/ FastAPI service. Use /highlight/{analysis_id} endpoint from the FastAPI service.',
      hint: 'The app/ directory contains the complete implementation - integrate it via HTTP calls',
    });
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating report',
      error: error.message,
    });
  }
};

/**
 * Send PDF report as download
 */
const sendPDFReport = (res, reportPath, documentId) => {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="report-${documentId}.pdf"`
  );
  
  return res.sendFile(reportPath);
};

// NOTE: All PDF generation, text extraction, and preprocessing is done in app/ FastAPI service
// This function is removed - no text processing should happen in backend

