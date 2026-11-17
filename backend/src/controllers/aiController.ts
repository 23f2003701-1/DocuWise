import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/responseHelper';
import DocumentModel from '../models/Document';
import AIAnalysis from '../models/AIAnalysis';
import { getFileBuffer } from '../services/cloudinaryService';
import { analyzeDocument as geminiAnalyze } from '../services/geminiService';
import { calculateExpiryStatus } from '../services/expiryService';

export async function analyzeDocumentAI(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { documentId } = req.body;

    if (!documentId) {
      sendError(res, 400, 'Document ID is required');
      return;
    }

    const document = await DocumentModel.findOne({ _id: documentId, userId: req.user!._id });

    if (!document) {
      sendError(res, 404, 'Document not found');
      return;
    }

    // For Cloudinary PDFs, fetching with .jpg extension renders page 1 as an image,
    // avoiding Cloudinary's default raw PDF ACL delivery block and providing optimal format for Gemini.
    let fetchUrl = document.fileUrl;
    let mimeType = 'image/jpeg';
    if (document.fileType === 'pdf') {
      fetchUrl = document.fileUrl.replace(/\.pdf$/i, '.jpg');
      mimeType = 'image/jpeg';
    }

    const fileBuffer = await getFileBuffer(fetchUrl);
    const result = await geminiAnalyze(fileBuffer, mimeType);

    const analysis = await AIAnalysis.findOneAndUpdate(
      { documentId: document._id, userId: req.user!._id },
      {
        documentId: document._id,
        userId: req.user!._id,
        documentType: result.documentType,
        category: result.category,
        holderName: result.holderName,
        documentNumber: result.documentNumber,
        issuingAuthority: result.issuingAuthority,
        issueDate: result.issueDate,
        expiryDate: result.expiryDate,
        summary: result.summary,
        importantDetails: result.importantDetails,
        extractedFields: result.extractedFields,
        confidence: result.confidence,
        rawResponse: JSON.stringify(result),
      },
      { upsert: true, new: true }
    );

    // Update document with AI-extracted fields only if not already manually set
    if (!document.category && result.category) {
      document.category = result.category;
    }
    if (!document.holderName && result.holderName) {
      document.holderName = result.holderName;
    }
    if (!document.documentNumber && result.documentNumber) {
      document.documentNumber = result.documentNumber;
    }
    if (!document.issuingAuthority && result.issuingAuthority) {
      document.issuingAuthority = result.issuingAuthority;
    }
    if (!document.issueDate && result.issueDate) {
      document.issueDate = new Date(result.issueDate);
    }
    if (!document.expiryDate && result.expiryDate) {
      document.expiryDate = new Date(result.expiryDate);
    }

    if (document.expiryDate) {
      document.expiryStatus = calculateExpiryStatus(new Date(document.expiryDate));
    }

    document.isAIProcessed = true;

    await document.save();

    sendSuccess(res, 200, 'Document analyzed successfully', { analysis, document });
  } catch (error) {
    sendError(res, 500, 'Failed to analyze document', error);
  }
}

export async function getAnalysis(req: AuthRequest, res: Response): Promise<void> {
  try {
    const analysis = await AIAnalysis.findOne({
      documentId: req.params.documentId,
      userId: req.user!._id,
    });

    if (!analysis) {
      sendError(res, 404, 'Analysis not found');
      return;
    }

    sendSuccess(res, 200, 'Analysis retrieved successfully', analysis);
  } catch (error) {
    sendError(res, 500, 'Failed to retrieve analysis', error);
  }
}
