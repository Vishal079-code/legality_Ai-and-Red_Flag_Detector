import express from "express";
import { uploadAndAnalyze, getAnalysis } from "../controllers/analysisController.js";
import multer from "multer";

const upload = multer({ dest: "uploads/" });
const router = express.Router();

router.post("/", upload.single("file"), uploadAndAnalyze);
router.get("/:id", getAnalysis);

export default router;
