import { Router } from 'express';
import { AuthController } from './auth.controller';
import { signupSchema, loginSchema, updateProfileSchema, googleAuthSchema, forgotPasswordSchema, resetPasswordSchema, verifyEmailSchema } from './auth.validation';
import { validateRequest } from '../../common/middleware/validation.middleware';
import { authenticate } from '../../common/middleware/auth.middleware';

const router = Router();
const controller = new AuthController();

/**
 * @openapi
 * /api/v1/auth/profile:
 *   patch:
 *     summary: Update the authenticated user's profile
 *     description: Update first name or last name for the currently authenticated user.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.post('/signup', validateRequest({ body: signupSchema }), controller.signup);
router.post('/login', validateRequest({ body: loginSchema }), controller.login);
router.post('/google', validateRequest({ body: googleAuthSchema }), controller.googleAuth);
router.post('/logout', authenticate, controller.logout);
router.get('/me', authenticate, controller.me);
router.patch('/profile', authenticate, validateRequest({ body: updateProfileSchema }), controller.updateProfile);
router.post('/refresh', controller.refreshToken);
router.get('/sessions', authenticate, controller.getSessions);
router.delete('/sessions/:sessionId', authenticate, controller.revokeSession);
router.delete('/sessions', authenticate, controller.revokeAllSessions);
router.post('/forgot-password', validateRequest({ body: forgotPasswordSchema }), controller.forgotPassword);
router.post('/reset-password', validateRequest({ body: resetPasswordSchema }), controller.resetPassword);
router.post('/verify-email', validateRequest({ body: verifyEmailSchema }), controller.verifyEmail);

export default router;
