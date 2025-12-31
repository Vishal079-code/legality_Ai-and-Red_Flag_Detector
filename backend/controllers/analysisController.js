import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import Document from "../models/Document.js";

const COLAB_URL = process.env.COLAB_URL;

export const uploadAndAnalyze = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const form = new FormData();
    form.append("file", fs.createReadStream(req.file.path));

    const response = await axios.post(
      `${COLAB_URL}/analyze`,
      form,
      {
        headers: form.getHeaders(),
        timeout: 3000000 // 5 minutes
      }
    );

    const result = response.data;

    const savedDoc = await Document.create({
      fileName: req.file.originalname,
      extractedText: result.extracted_text,
      risks: result.risks,
      riskScore: result.risk_score,
      analysisId: result.analysis_id,
      raw: result
    });

    res.status(201).json({
      documentId: savedDoc._id
    });

  } catch (err) {
    console.error("UPLOAD+ANALYZE ERROR:", err.message);
    res.status(500).json({ message: "Analysis failed" });
  }
};

export const getAnalysis = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);

    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.json({
      extractedText: doc.extractedText,
      risks: doc.risks,
      riskScore: doc.riskScore
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch analysis" });
  }
};
