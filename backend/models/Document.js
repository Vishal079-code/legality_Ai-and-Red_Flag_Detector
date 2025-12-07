import mongoose from 'mongoose';

const clauseSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  startIndex: {
    type: Number,
    default: 0,
  },
  endIndex: {
    type: Number,
    default: 0,
  },
});

const documentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    clauses: {
      type: [clauseSchema],
      default: [],
    },
    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    fileName: {
      type: String,
      default: '',
    },
    fileType: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Document = mongoose.model('Document', documentSchema);

export default Document;

