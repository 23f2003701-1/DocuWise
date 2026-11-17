import { Router } from 'express';
import {
  uploadDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  replaceDocument,
  getCategories,
  getExpiryTracker,
} from '../controllers/documentController';
import auth from '../middleware/auth';
import upload from '../middleware/upload';

const router = Router();

// All routes require authentication
router.use(auth);

// Static routes BEFORE parameterized routes
router.get('/categories', getCategories);
router.get('/expiry-tracker', getExpiryTracker);

// CRUD routes
router.get('/', getDocuments);
router.get('/:id', getDocumentById);
router.post('/upload', upload.single('document'), uploadDocument);
router.put('/:id', updateDocument);
router.put('/:id/replace', upload.single('document'), replaceDocument);
router.delete('/:id', deleteDocument);

export default router;
