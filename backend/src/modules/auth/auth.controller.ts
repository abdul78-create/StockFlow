import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthService } from './auth.service';
import { ResponseFormatter } from '../../common/responses';
import { config } from '../../infra/config';
import { TokenPayload } from '../../common/types';
import { UnauthorizedError } from '../../common/errors/app-error';
import prisma from '../../infra/database/prisma';

export class AuthController {
  private authService: AuthService;

  constructor(authService = new AuthService()) {
    this.authService = authService;
  }

  private generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRES_IN as unknown as number,
    });
  }

  private sendTokenCookies(res: Response, token: string, refreshToken: string): void {
    // secure=true only when HTTPS is explicitly enabled (real production with TLS).
    // Local Docker dev runs NODE_ENV=production over plain HTTP, so we must not force secure there.
    const cookieOptions = {
      httpOnly: true,
      secure: config.NODE_ENV === 'production' && config.HTTPS === 'true',
      sameSite: 'lax' as const,
    };

    res.cookie('token', token, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      path: '/api/v1/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  private getRequestInfo(req: Request) {
    return {
      ip: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    };
  }

  signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reqInfo = this.getRequestInfo(req);
      const result = await this.authService.signup(req.body, reqInfo);

      const tokenPayload: TokenPayload = {
        id: result.user.id,
        email: result.user.email,
        sessionId: result.session.id,
      };

      const token = this.generateToken(tokenPayload);
      this.sendTokenCookies(res, token, result.refreshToken);

      ResponseFormatter.success(res, 201, 'User signed up successfully', result);
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reqInfo = this.getRequestInfo(req);
      const result = await this.authService.login(req.body, reqInfo);

      const tokenPayload: TokenPayload = {
        id: result.user.id,
        email: result.user.email,
        sessionId: result.session.id,
      };

      const token = this.generateToken(tokenPayload);
      this.sendTokenCookies(res, token, result.refreshToken);

      ResponseFormatter.success(res, 200, 'User logged in successfully', result);
    } catch (error) {
      next(error);
    }
  };

  googleAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reqInfo = this.getRequestInfo(req);
      const result = await this.authService.googleAuth(req.body.idToken, reqInfo);

      const tokenPayload: TokenPayload = {
        id: result.user.id,
        email: result.user.email,
        sessionId: result.session.id,
      };

      const token = this.generateToken(tokenPayload);
      this.sendTokenCookies(res, token, result.refreshToken);

      ResponseFormatter.success(res, 200, 'Google Authentication successful', result);
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.user?.sessionId) {
        try {
          await prisma.session.delete({
            where: { id: req.user.sessionId }
          });
          console.log(`Deleted session ${req.user.sessionId}`);
        } catch (e) {
          console.error(`Failed to delete session ${req.user.sessionId}`, e);
        }
      }

      res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
      res.cookie('refreshToken', '', { httpOnly: true, path: '/api/v1/auth/refresh', expires: new Date(0) });
      
      ResponseFormatter.success(res, 200, 'User logged out successfully', null);
    } catch (error) {
      next(error);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return next(new UnauthorizedError('Unauthorized'));
      }

      const profile = await this.authService.getProfile(req.user.email);
      ResponseFormatter.success(res, 200, 'Profile retrieved successfully', profile);
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return next(new UnauthorizedError('Unauthorized'));
      }

      const profile = await this.authService.updateProfile(req.user.id, req.body);
      ResponseFormatter.success(res, 200, 'Profile updated successfully', profile);
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) throw new UnauthorizedError('No refresh token provided');

      const result = await this.authService.refreshToken(refreshToken, this.getRequestInfo(req));
      
      const tokenPayload: TokenPayload = {
        id: result.user.id,
        email: result.user.email,
        sessionId: result.session.id,
      };

      const token = this.generateToken(tokenPayload);
      this.sendTokenCookies(res, token, result.refreshToken);

      ResponseFormatter.success(res, 200, 'Token refreshed', null);
    } catch (error) {
      next(error);
    }
  };

  getSessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError('Unauthorized');
      const sessions = await this.authService.getSessions(req.user.id);
      ResponseFormatter.success(res, 200, 'Sessions retrieved', sessions);
    } catch (error) { next(error); }
  };

  revokeSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError('Unauthorized');
      await this.authService.revokeSession(req.user.id, req.params.sessionId);
      ResponseFormatter.success(res, 200, 'Session revoked', null);
    } catch (error) { next(error); }
  };

  revokeAllSessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError('Unauthorized');
      await this.authService.revokeAllSessions(req.user.id, req.user.sessionId);
      ResponseFormatter.success(res, 200, 'All other sessions revoked', null);
    } catch (error) { next(error); }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.forgotPassword(req.body.email);
      ResponseFormatter.success(res, 200, result.message, { devToken: result.devToken });
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.resetPassword(req.body.token, req.body.password);
      ResponseFormatter.success(res, 200, result.message, null);
    } catch (error) {
      next(error);
    }
  };

  verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.verifyEmail(req.body.token);
      ResponseFormatter.success(res, 200, result.message, null);
    } catch (error) {
      next(error);
    }
  };
}
