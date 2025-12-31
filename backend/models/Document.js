import mongoose from "mongoose";

const clauseSchema = new mongoose.Schema({
  text: String,
  level: String,
  reason: String,
  category: String,
  startIndex: Number,
  endIndex: Number
});

const documentSchema = new mongoose.Schema({
  fileName: String,

  extractedText: {
    type: String,
    default: ""
  },

  risks: {
    type: [clauseSchema],
    default: []
  },

  riskScore: {
    type: Number,
    default: 0
  },

  analysisId: {
    type: String,
    default: ""
  },

  raw: Object
}, { timestamps: true });

export default mongoose.model("Document", documentSchema);
