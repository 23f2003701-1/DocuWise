import { Router } from 'express';
import { getNotifications, updatePreferences } from '../controllers/notificationController';
import auth from '../middleware/auth';

const router = Router();

router.use(auth);

router.get('/', getNotifications);
router.put('/preferences', updatePreferences);

export default router;
