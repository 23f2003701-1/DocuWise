import { Router } from 'express';
import { analyzeDocumentAI, getAnalysis } from '../controllers/aiController';
import auth from '../middleware/auth';

const router = Router();

router.use(auth);

router.post('/analyze', analyzeDocumentAI);
router.get('/analysis/:documentId', getAnalysis);

export default router;
