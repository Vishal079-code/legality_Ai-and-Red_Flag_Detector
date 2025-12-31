import fs from "fs";
import path from "path";
import Document from "../models/Document.js";

export const downloadPDFReport = async (req, res) => {
  const doc = await Document.findById(req.params.id);

  if (!doc) return res.status(404).end();

  const pdfPath = `reports/${doc._id}.pdf`;

  // assume colab already generated highlighted pdf
  res.download(pdfPath, "analysis-report.pdf");
};
