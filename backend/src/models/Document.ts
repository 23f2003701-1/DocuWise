import mongoose, { Document, Schema } from 'mongoose';

export interface IDocument extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  category: string;
  description?: string;
  fileUrl: string;
  cloudinaryPublicId: string;
  fileType: 'pdf' | 'image';
  fileSize: number;
  originalFileName: string;
  holderName?: string;
  documentNumber?: string;
  issuingAuthority?: string;
  issueDate?: Date;
  expiryDate?: Date;
  expiryStatus?: 'Valid' | 'Expiring Soon' | 'Expired' | 'No Expiry';
  tags?: string[];
  isAIProcessed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<IDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    category: {
      type: String,
      enum: ['Identity', 'Educational', 'Vehicle', 'Insurance', 'Financial', 'Property', 'Medical', 'Legal', 'Other'],
      default: 'Other',
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },
    cloudinaryPublicId: {
      type: String,
      required: [true, 'Cloudinary public ID is required'],
    },
    fileType: {
      type: String,
      enum: ['pdf', 'image'],
      required: [true, 'File type is required'],
    },
    fileSize: {
      type: Number,
      required: [true, 'File size is required'],
    },
    originalFileName: {
      type: String,
      required: [true, 'Original file name is required'],
    },
    holderName: {
      type: String,
      trim: true,
    },
    documentNumber: {
      type: String,
      trim: true,
    },
    issuingAuthority: {
      type: String,
      trim: true,
    },
    issueDate: {
      type: Date,
    },
    expiryDate: {
      type: Date,
    },
    expiryStatus: {
      type: String,
      enum: ['Valid', 'Expiring Soon', 'Expired', 'No Expiry'],
      default: 'No Expiry',
    },
    tags: {
      type: [String],
      default: [],
    },
    isAIProcessed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common queries
documentSchema.index({ userId: 1, category: 1 });
documentSchema.index({ userId: 1, expiryStatus: 1 });
documentSchema.index({ userId: 1, expiryDate: 1 });
documentSchema.index({ userId: 1, title: 'text', holderName: 'text', documentNumber: 'text', description: 'text' });

export default mongoose.model<IDocument>('Document', documentSchema);
