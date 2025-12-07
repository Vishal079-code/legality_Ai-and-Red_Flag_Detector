import express from 'express';
import { getAnalysis } from '../controllers/analysisController.js';

const router = express.Router();

// Get analysis route
router.get('/:id', getAnalysis);

export default router;

