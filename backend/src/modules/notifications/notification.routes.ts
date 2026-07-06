import { Router } from 'express';
import { authenticate } from '../../common/middleware/auth.middleware';
import { getNotifications, getUnreadCount, markRead, markAllRead } from './notification.controller';

const router = Router();
router.use(authenticate);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/:id/read', markRead);
router.put('/mark-all-read', markAllRead);

export default router;
