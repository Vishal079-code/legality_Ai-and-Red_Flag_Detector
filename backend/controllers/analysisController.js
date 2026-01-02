import Document from '../models/Document.js';

/**
 * Get analysis results for a document from database
 * NOTE: This only retrieves stored data. NO TEXT EXTRACTION OR PREPROCESSING is done here.
 * All text extraction and analysis is handled by app/ FastAPI service.
 */
export const getAnalysis = async (req, res) => {
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

    // Format response to match frontend expectations
    const response = {
      success: true,
      extractedText: document.text,
      risks: document.clauses.map((clause) => ({
        text: clause.text,
        level: clause.level,
        riskLevel: clause.level, // Alias for frontend compatibility
        reason: clause.reason,
        description: clause.reason, // Alias for frontend compatibility
        category: clause.category,
        startIndex: clause.startIndex,
        endIndex: clause.endIndex,
        start: clause.startIndex, // Alias for frontend compatibility
        end: clause.endIndex, // Alias for frontend compatibility
      })),
      riskScore: document.riskScore,
      documentId: document._id.toString(),
      createdAt: document.createdAt,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analysis',
      error: error.message,
    });
  }
};


