import { Router } from 'express';
import { UserController } from './user.controller';
import { createUserSchema, updateUserSchema, userIdParamSchema } from './user.validation';
import { validateRequest } from '../../common/middleware/validation.middleware';
import { authenticate, requirePermission } from '../../common/middleware/auth.middleware';

const router = Router();
const controller = new UserController();

router.get('/', authenticate, requirePermission('members.view'), controller.getUsers);

router.get(
  '/:id',
  authenticate,
  validateRequest({ params: userIdParamSchema }),
  controller.getUserById,
);

router.post(
  '/',
  authenticate,
  requirePermission('members.invite'),
  validateRequest({ body: createUserSchema }),
  controller.createUser,
);

router.patch(
  '/:id',
  authenticate,
  requirePermission('members.update'),
  validateRequest({ params: userIdParamSchema, body: updateUserSchema }),
  controller.updateUser,
);

router.delete(
  '/:id',
  authenticate,
  requirePermission('members.delete'),
  validateRequest({ params: userIdParamSchema }),
  controller.deleteUser,
);

/**
 * @openapi
 * /api/v1/users/{id}/restore:
 *   post:
 *     summary: Restore a soft-deleted user
 *     description: Restores a soft-deleted user inside the tenant organization. Scoped to Admin role.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User restored successfully.
 *       404:
 *         description: User not found.
 */
router.post(
  '/:id/restore',
  authenticate,
  requirePermission('members.update'),
  validateRequest({ params: userIdParamSchema }),
  controller.restoreUser,
);

export default router;
