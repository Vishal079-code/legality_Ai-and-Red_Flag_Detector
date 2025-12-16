import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import Document from '../models/Document.js';
import { generatePDFReport } from '../services/pythonService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate and download PDF report with highlighted risks
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

    // Try to use Python model if original PDF is available
    if (document.originalFilePath) {
      try {
        // Use Python model service to generate highlighted PDF
        const result = await generatePDFReport(document.originalFilePath, id);
        
        if (result.success && result.reportPath) {
          // Update document to mark report as generated
          document.reportGenerated = true;
          await document.save();
          
          return sendPDFReport(res, result.reportPath, id);
        }
      } catch (pythonError) {
        console.error('Python model error:', pythonError);
        // Fall through to fallback
      }
    }
    
    // Fallback: If Python model not available or failed
    // You can implement a Node.js-based PDF generation here
    // For now, return error asking to integrate Python model
    return res.status(503).json({
      success: false,
      message: 'PDF report generation requires Python model integration. Please integrate your model in backend/python/model_service.py',
      hint: 'Store original PDF file path in document.originalFilePath for PDF generation',
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

/**
 * Generate a simple text-based PDF report (fallback)
 * Replace this with your Python model integration
 */
const generateTextBasedReport = async (document, outputPath) => {
  // This is a placeholder - replace with actual PDF generation
  // You can use libraries like pdfkit or call your Python model
  
  // For now, create a simple text file as placeholder
  // In production, use your Python model's generate_highlighted_pdf function
  const reportContent = `
LEGALITY AI RED FLAG DETECTOR - ANALYSIS REPORT
===============================================

Document ID: ${document._id}
Analysis Date: ${document.createdAt}
Risk Score: ${document.riskScore}/100

EXTRACTED TEXT:
${document.text}

IDENTIFIED RISKS:
${document.clauses.map((clause, idx) => `
${idx + 1}. [${clause.level}] ${clause.category}
   Text: ${clause.text}
   Reason: ${clause.reason}
`).join('\n')}

END OF REPORT
`;

  await fs.writeFile(outputPath.replace('.pdf', '.txt'), reportContent);
  
  // Copy a placeholder PDF or generate one
  // In production, this should call your Python model
  throw new Error('PDF generation requires Python model integration. Please integrate your model in python/model_service.py');
};

