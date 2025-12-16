import express from 'express';
import { getAnalysis } from '../controllers/analysisController.js';
import { downloadPDFReport } from '../controllers/reportController.js';

const router = express.Router();

// Get analysis route
router.get('/:id', getAnalysis);

export default router;

// Report routes
export const reportRouter = express.Router();
reportRouter.get('/:id', downloadPDFReport);


