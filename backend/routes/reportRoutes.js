import express from 'express';
import { downloadPDFReport } from '../controllers/reportController.js';

const router = express.Router();

// Download PDF report
router.get('/:id', downloadPDFReport);

export default router;
