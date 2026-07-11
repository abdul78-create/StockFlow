import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { config } from '../../infra/config';
import { AuthRepository } from './auth.repository';
import { ConflictError, UnauthorizedError } from '../../common/errors/app-error';
import { SignupInput, LoginInput } from './auth.validation';
import prisma from '../../infra/database/prisma';
import { OAuth2Client } from 'google-auth-library';
import { AuthProvider } from '@prisma/client';

export class AuthService {
  private authRepository: AuthRepository;
  private googleClient: OAuth2Client;

  constructor(authRepository = new AuthRepository()) {
    this.authRepository = authRepository;
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  private async createSession(userId: string, reqInfo?: { ip?: string, userAgent?: string }) {
    const refreshToken = crypto.randomBytes(40).toString('hex');
    const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const session = await prisma.session.create({
      data: {
        userId,
        refreshTokenHash: hash,
        expiresAt,
        ipAddress: reqInfo?.ip,
        browser: reqInfo?.userAgent,
      }
    });

    return { session, refreshToken };
  }

  async signup(input: SignupInput, reqInfo?: { ip?: string, userAgent?: string }) {
    const existingUser = await this.authRepository.findUserByEmail(input.email);
    if (existingUser) {
      throw new ConflictError('A user with this email address already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(input.password, salt);

    const user = await this.authRepository.createUser(
      input.email,
      passwordHash,
      input.firstName,
      input.lastName,
    );

    const { session, refreshToken } = await this.createSession(user.id, reqInfo);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      organizations: [], // Empty for new user
      session,
      refreshToken
    };
  }

  async login(input: LoginInput, reqInfo?: { ip?: string, userAgent?: string }) {
    const user = await this.authRepository.findUserByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash || '');
    if (!isMatch || !user.passwordHash) {
      throw new UnauthorizedError('Invalid email or password');
    }

    await this.authRepository.updateLastLogin(user.id);

    const { session, refreshToken } = await this.createSession(user.id, reqInfo);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, memberships, ...userWithoutPassword } = user;
    const organizations = memberships.map(m => ({
      ...m.organization,
      role: m.role,
      membershipId: m.id
    }));

    return {
      user: userWithoutPassword,
      organizations,
      session,
      refreshToken
    };
  }

  async getProfile(email: string) {
    const user = await this.authRepository.findUserByEmail(email);
    if (!user) return null;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, memberships, ...userWithoutPassword } = user;
    const organizations = memberships.map(m => ({
      ...m.organization,
      role: m.role,
      membershipId: m.id
    }));

    return { ...userWithoutPassword, organizations };
  }

  async updateProfile(userId: string, input: { firstName?: string; lastName?: string }) {
    const updatedUser = await this.authRepository.updateProfile(userId, input);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async refreshToken(token: string, reqInfo?: { ip?: string, userAgent?: string }) {
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const session = await prisma.session.findFirst({
      where: { refreshTokenHash: hash },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      if (session) await prisma.session.delete({ where: { id: session.id } });
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    // Revoke old session and issue new one
    await prisma.session.delete({ where: { id: session.id } });
    const newSessionData = await this.createSession(session.userId, reqInfo);

    return {
      user: session.user,
      session: newSessionData.session,
      refreshToken: newSessionData.refreshToken
    };
  }

  async getSessions(userId: string) {
    return prisma.session.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        ipAddress: true,
        browser: true,
        createdAt: true,
        lastUsedAt: true,
      }
    });
  }

  async revokeSession(userId: string, sessionId: string) {
    await prisma.session.deleteMany({
      where: { id: sessionId, userId }
    });
  }

  async revokeAllSessions(userId: string, currentSessionId: string) {
    await prisma.session.deleteMany({
      where: { 
        userId,
        id: { not: currentSessionId }
      }
    });
  }

  async googleAuth(idToken: string, reqInfo?: { ip?: string, userAgent?: string }) {
    let payload;
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (error) {
      throw new UnauthorizedError('Invalid Google ID token');
    }

    if (!payload || !payload.email) {
      throw new UnauthorizedError('Invalid Google payload');
    }

    const { email, given_name, family_name, picture, sub: googleId } = payload;
    
    let user: any = await this.authRepository.findUserByEmail(email);
    
    if (user) {
      await this.authRepository.updateUserGoogle(user.id, googleId, picture);
      user = await this.authRepository.findUserByEmail(email);
    } else {
      await this.authRepository.createUser(
        email,
        null,
        given_name || 'Google',
        family_name || 'User',
        AuthProvider.GOOGLE,
        googleId,
        picture
      );
      user = await this.authRepository.findUserByEmail(email);
    }

    if (!user) {
      throw new UnauthorizedError('Failed to retrieve user after Google login');
    }

    const { session, refreshToken } = await this.createSession(user.id, reqInfo);
    
    const { passwordHash: _, memberships, ...userWithoutPassword } = user;
    const organizations = memberships ? memberships.map((m: any) => ({
      ...m.organization,
      role: m.role,
      membershipId: m.id
    })) : [];

    return {
      user: userWithoutPassword,
      organizations,
      session,
      refreshToken
    };
  }

  async forgotPassword(email: string) {
    const user = await this.authRepository.findUserByEmail(email);
    if (!user) {
      return { message: "Password reset link sent to your email" };
    }

    const token = jwt.sign({ email, type: 'reset-password' }, config.JWT_SECRET, { expiresIn: '15m' });
    console.log(`[DEVELOPMENT] Password reset token for ${email}: ${token}`);
    
    return { 
      message: "Password reset link sent to your email",
      devToken: config.NODE_ENV === 'development' || process.env.DEMO_MODE === 'true' ? token : undefined 
    };
  }

  async resetPassword(token: string, passwordHash: string) {
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET) as any;
      if (decoded.type !== 'reset-password') {
        throw new UnauthorizedError('Invalid reset token type');
      }

      const user = await this.authRepository.findUserByEmail(decoded.email);
      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      const salt = await bcrypt.genSalt(10);
      const newHash = await bcrypt.hash(passwordHash, salt);

      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash }
      });

      return { message: "Password has been reset successfully" };
    } catch (err: any) {
      throw new UnauthorizedError(err.message || 'Invalid or expired reset token');
    }
  }

  async verifyEmail(token: string) {
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET) as any;
      if (decoded.type !== 'verify-email') {
        throw new UnauthorizedError('Invalid verification token type');
      }

      const user = await this.authRepository.findUserByEmail(decoded.email);
      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { isActive: true }
      });

      return { message: "Email verified successfully" };
    } catch (err: any) {
      throw new UnauthorizedError(err.message || 'Invalid or expired verification token');
    }
  }
}
