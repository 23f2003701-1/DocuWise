import mongoose, { Document, Schema } from 'mongoose';

export interface IReminder extends Document {
  userId: mongoose.Types.ObjectId;
  documentId: mongoose.Types.ObjectId;
  reminderType: '30_day' | '7_day' | '1_day';
  message: string;
  isRead: boolean;
  sentAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const reminderSchema = new Schema<IReminder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    documentId: {
      type: Schema.Types.ObjectId,
      ref: 'Document',
      required: [true, 'Document ID is required'],
    },
    reminderType: {
      type: String,
      enum: ['30_day', '7_day', '1_day'],
      required: [true, 'Reminder type is required'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate reminders
reminderSchema.index({ documentId: 1, reminderType: 1 }, { unique: true });
reminderSchema.index({ userId: 1, sentAt: -1 });

export default mongoose.model<IReminder>('Reminder', reminderSchema);
