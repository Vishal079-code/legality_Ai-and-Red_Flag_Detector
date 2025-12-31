import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import Document from "../models/Document.js";

export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Send file to FastAPI
    const form = new FormData();
    form.append("file", fs.createReadStream(req.file.path));

    const fastapiRes = await axios.post(
      `${process.env.COLAB_URL}/analyze`,
      form,
      {
        headers: form.getHeaders(),
        timeout: 60000,
      }
    );

    // Save final result
    const doc = await Document.create({
      originalName: req.file.originalname,
      filePath: req.file.path,
      text: fastapiRes.data.text,
      clauses: fastapiRes.data.clauses,
      riskScore: fastapiRes.data.risk_score,
      analysisId: fastapiRes.data.analysis_id,
      status: "analyzed",
    });

    // 🚀 SEND RESULT TO FRONTEND
    res.status(200).json({
      documentId: doc._id,
      result: fastapiRes.data,
    });

  } catch (err) {
    console.error("UPLOAD+ANALYZE ERROR:", err.response?.data || err.message);
    res.status(500).json({ message: "Upload & analysis failed" });
  }
};
