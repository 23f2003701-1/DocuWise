import mongoose, { Document, Schema } from 'mongoose';

export interface IAIAnalysis extends Document {
  documentId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  documentType: string;
  category?: string;
  extractedFields?: Record<string, any>;
  holderName?: string;
  documentNumber?: string;
  issuingAuthority?: string;
  issueDate?: string;
  expiryDate?: string;
  summary?: string;
  importantDetails?: string[];
  confidence: number;
  rawResponse?: string;
  createdAt: Date;
  updatedAt: Date;
}

const aiAnalysisSchema = new Schema<IAIAnalysis>(
  {
    documentId: {
      type: Schema.Types.ObjectId,
      ref: 'Document',
      required: [true, 'Document ID is required'],
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    documentType: {
      type: String,
      default: 'unknown',
    },
    category: {
      type: String,
    },
    extractedFields: {
      type: Schema.Types.Mixed,
      default: {},
    },
    holderName: {
      type: String,
    },
    documentNumber: {
      type: String,
    },
    issuingAuthority: {
      type: String,
    },
    issueDate: {
      type: String,
    },
    expiryDate: {
      type: String,
    },
    summary: {
      type: String,
    },
    importantDetails: {
      type: [String],
      default: [],
    },
    confidence: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },
    rawResponse: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for quick lookups
aiAnalysisSchema.index({ documentId: 1, userId: 1 });

export default mongoose.model<IAIAnalysis>('AIAnalysis', aiAnalysisSchema);
