import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { AuthRepository } from './auth.repository';
import { ConflictError, UnauthorizedError } from '../../common/errors/app-error';
import { SignupInput, LoginInput } from './auth.validation';
import prisma from '../../infra/database/prisma';

export class AuthService {
  private authRepository: AuthRepository;

  constructor(authRepository = new AuthRepository()) {
    this.authRepository = authRepository;
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

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

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
}
