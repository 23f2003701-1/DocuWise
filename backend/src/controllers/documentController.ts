import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/responseHelper';
import DocumentModel, { IDocument } from '../models/Document';
import AIAnalysis from '../models/AIAnalysis';
import Reminder from '../models/Reminder';
import DocumentVersion from '../models/DocumentVersion';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinaryService';
import { calculateExpiryStatus } from '../services/expiryService';
import fs from 'fs';

export async function uploadDocument(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.file) {
      sendError(res, 400, 'No file uploaded');
      return;
    }

    const uploadResult = await uploadToCloudinary(req.file.path, 'docuwise/documents');

    fs.unlinkSync(req.file.path);

    const fileType = req.file.mimetype.startsWith('image/') ? 'image' : 'pdf';

    const docData: Partial<IDocument> = {
      userId: req.user!._id,
      title: req.body.title,
      category: req.body.category,
      description: req.body.description,
      holderName: req.body.holderName,
      documentNumber: req.body.documentNumber,
      issuingAuthority: req.body.issuingAuthority,
      issueDate: req.body.issueDate,
      expiryDate: req.body.expiryDate,
      fileUrl: uploadResult.url,
      cloudinaryPublicId: uploadResult.publicId,
      fileType,
      fileSize: uploadResult.bytes,
      originalFileName: req.file.originalname,
    };

    if (req.body.expiryDate) {
      docData.expiryStatus = calculateExpiryStatus(new Date(req.body.expiryDate));
    }

    const document = await DocumentModel.create(docData);

    sendSuccess(res, 201, 'Document uploaded successfully', document);
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    sendError(res, 500, 'Failed to upload document', error);
  }
}

export async function getDocuments(req: AuthRequest, res: Response): Promise<void> {
  try {
    const query: any = { userId: req.user!._id };

    if (req.query.search) {
      const searchRegex = { $regex: req.query.search as string, $options: 'i' };
      query.$or = [
        { title: searchRegex },
        { holderName: searchRegex },
        { documentNumber: searchRegex },
        { description: searchRegex },
      ];
    }

    if (req.query.category) {
      query.category = req.query.category;
    }

    if (req.query.status) {
      query.expiryStatus = req.query.status;
    }

    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const order = (req.query.order as string) === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [documents, total] = await Promise.all([
      DocumentModel.find(query).sort({ [sortBy]: order }).skip(skip).limit(limit),
      DocumentModel.countDocuments(query),
    ]);

    sendSuccess(res, 200, 'Documents retrieved successfully', {
      documents,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    sendError(res, 500, 'Failed to retrieve documents', error);
  }
}

export async function getDocumentById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const document = await DocumentModel.findOne({ _id: req.params.id, userId: req.user!._id });

    if (!document) {
      sendError(res, 404, 'Document not found');
      return;
    }

    sendSuccess(res, 200, 'Document retrieved successfully', document);
  } catch (error) {
    sendError(res, 500, 'Failed to retrieve document', error);
  }
}

export async function updateDocument(req: AuthRequest, res: Response): Promise<void> {
  try {
    const document = await DocumentModel.findOne({ _id: req.params.id, userId: req.user!._id });

    if (!document) {
      sendError(res, 404, 'Document not found');
      return;
    }

    const updatableFields: (keyof IDocument)[] = [
      'title', 'category', 'description', 'holderName',
      'documentNumber', 'issuingAuthority', 'issueDate', 'expiryDate', 'tags',
    ];

    for (const field of updatableFields) {
      if (req.body[field] !== undefined) {
        (document as any)[field] = req.body[field];
      }
    }

    if (req.body.expiryDate !== undefined) {
      document.expiryStatus = calculateExpiryStatus(
        req.body.expiryDate ? new Date(req.body.expiryDate) : undefined
      );
    }

    await document.save();

    sendSuccess(res, 200, 'Document updated successfully', document);
  } catch (error) {
    sendError(res, 500, 'Failed to update document', error);
  }
}

export async function deleteDocument(req: AuthRequest, res: Response): Promise<void> {
  try {
    const document = await DocumentModel.findOne({ _id: req.params.id, userId: req.user!._id });

    if (!document) {
      sendError(res, 404, 'Document not found');
      return;
    }

    await deleteFromCloudinary(document.cloudinaryPublicId);

    await Promise.all([
      AIAnalysis.deleteMany({ documentId: document._id }),
      Reminder.deleteMany({ documentId: document._id }),
      DocumentVersion.deleteMany({ documentId: document._id }),
    ]);

    await document.deleteOne();

    sendSuccess(res, 200, 'Document deleted successfully');
  } catch (error) {
    sendError(res, 500, 'Failed to delete document', error);
  }
}

export async function replaceDocument(req: AuthRequest, res: Response): Promise<void> {
  try {
    const document = await DocumentModel.findOne({ _id: req.params.id, userId: req.user!._id });

    if (!document) {
      sendError(res, 404, 'Document not found');
      return;
    }

    if (!req.file) {
      sendError(res, 400, 'No file uploaded');
      return;
    }

    const existingVersionCount = await DocumentVersion.countDocuments({ documentId: document._id });

    await DocumentVersion.create({
      documentId: document._id,
      userId: req.user!._id,
      fileUrl: document.fileUrl,
      cloudinaryPublicId: document.cloudinaryPublicId,
      fileType: document.fileType,
      fileSize: document.fileSize,
      originalFileName: document.originalFileName,
      versionNumber: existingVersionCount + 1,
    });

    const uploadResult = await uploadToCloudinary(req.file.path, 'docuwise/documents');

    await deleteFromCloudinary(document.cloudinaryPublicId);

    fs.unlinkSync(req.file.path);

    document.fileUrl = uploadResult.url;
    document.cloudinaryPublicId = uploadResult.publicId;
    document.fileType = req.file.mimetype.startsWith('image/') ? 'image' : 'pdf';
    document.fileSize = uploadResult.bytes;
    document.originalFileName = req.file.originalname;

    await document.save();

    sendSuccess(res, 200, 'Document replaced successfully', document);
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    sendError(res, 500, 'Failed to replace document', error);
  }
}

export async function getCategories(req: AuthRequest, res: Response): Promise<void> {
  try {
    const categories = await DocumentModel.aggregate([
      { $match: { userId: req.user!._id } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { _id: 0, category: '$_id', count: '$count' } },
      { $sort: { count: -1 } },
    ]);

    sendSuccess(res, 200, 'Categories retrieved successfully', categories);
  } catch (error) {
    sendError(res, 500, 'Failed to retrieve categories', error);
  }
}

export async function getExpiryTracker(req: AuthRequest, res: Response): Promise<void> {
  try {
    const documents = await DocumentModel.find({ userId: req.user!._id });

    const expiringSoon: IDocument[] = [];
    const expired: IDocument[] = [];
    const valid: IDocument[] = [];
    const noExpiry: IDocument[] = [];

    for (const doc of documents) {
      switch (doc.expiryStatus) {
        case 'Expiring Soon':
          expiringSoon.push(doc);
          break;
        case 'Expired':
          expired.push(doc);
          break;
        case 'Valid':
          valid.push(doc);
          break;
        case 'No Expiry':
        default:
          noExpiry.push(doc);
          break;
      }
    }

    const statusCounts = await DocumentModel.aggregate([
      { $match: { userId: req.user!._id } },
      { $group: { _id: '$expiryStatus', count: { $sum: 1 } } },
    ]);

    const counts: Record<string, number> = {
      expiringSoon: 0,
      expired: 0,
      valid: 0,
      noExpiry: 0,
    };

    for (const sc of statusCounts) {
      switch (sc._id) {
        case 'Expiring Soon':
          counts.expiringSoon = sc.count;
          break;
        case 'Expired':
          counts.expired = sc.count;
          break;
        case 'Valid':
          counts.valid = sc.count;
          break;
        case 'No Expiry':
          counts.noExpiry = sc.count;
          break;
      }
    }

    sendSuccess(res, 200, 'Expiry tracker retrieved successfully', {
      expiringSoon,
      expired,
      valid,
      noExpiry,
      counts,
    });
  } catch (error) {
    sendError(res, 500, 'Failed to retrieve expiry tracker', error);
  }
}
