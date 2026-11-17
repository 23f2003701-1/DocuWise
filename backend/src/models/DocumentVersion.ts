import mongoose, { Document, Schema } from 'mongoose';

export interface IDocumentVersion extends Document {
  documentId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  fileUrl: string;
  cloudinaryPublicId: string;
  fileType: 'pdf' | 'image';
  fileSize: number;
  originalFileName: string;
  versionNumber: number;
  createdAt: Date;
  updatedAt: Date;
}

const documentVersionSchema = new Schema<IDocumentVersion>(
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
    versionNumber: {
      type: Number,
      required: [true, 'Version number is required'],
    },
  },
  {
    timestamps: true,
  }
);

documentVersionSchema.index({ documentId: 1, versionNumber: -1 });

export default mongoose.model<IDocumentVersion>('DocumentVersion', documentVersionSchema);
