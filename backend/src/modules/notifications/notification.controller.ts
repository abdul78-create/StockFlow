import { Request, Response, NextFunction } from 'express';
import { NotificationService } from './notification.service';
import { ResponseFormatter } from '../../common/responses';

const service = new NotificationService();

export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const data = await service.getForUser(req.workspace!.organizationId, req.user!.id, limit);
    ResponseFormatter.success(res, 200, 'Notifications retrieved', data);
  } catch (e) { next(e); }
};

export const getUnreadCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const count = await service.getUnreadCount(req.workspace!.organizationId, req.user!.id);
    ResponseFormatter.success(res, 200, 'Unread count', { count });
  } catch (e) { next(e); }
};

export const markRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.markRead(req.params.id, req.user!.id);
    ResponseFormatter.success(res, 200, 'Notification marked as read', null);
  } catch (e) { next(e); }
};

export const markAllRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.markAllRead(req.workspace!.organizationId, req.user!.id);
    ResponseFormatter.success(res, 200, 'All notifications marked as read', null);
  } catch (e) { next(e); }
};
