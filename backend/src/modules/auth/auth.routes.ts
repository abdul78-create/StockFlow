import { Router } from 'express';
import { AuthController } from './auth.controller';
import { signupSchema, loginSchema } from './auth.validation';
import { validateRequest } from '../../common/middleware/validation.middleware';
import { authenticate } from '../../common/middleware/auth.middleware';

const router = Router();
const controller = new AuthController();

router.post('/signup', validateRequest({ body: signupSchema }), controller.signup);
router.post('/login', validateRequest({ body: loginSchema }), controller.login);
router.post('/logout', controller.logout);
router.get('/me', authenticate, controller.me);
router.post('/refresh', controller.refreshToken);
router.get('/sessions', authenticate, controller.getSessions);
router.delete('/sessions/:sessionId', authenticate, controller.revokeSession);
router.delete('/sessions', authenticate, controller.revokeAllSessions);

export default router;
