import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthService } from './auth.service';
import { ResponseFormatter } from '../../common/responses';
import { config } from '../../infra/config';
import { TokenPayload } from '../../common/types';
import { UnauthorizedError } from '../../common/errors/app-error';

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

  private sendTokenCookie(res: Response, token: string): void {
    // Standard cookie configuration rules for high security
    res.cookie('token', token, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });
  }

  signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.signup(req.body);

      const tokenPayload: TokenPayload = {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        organizationId: result.user.organizationId,
      };

      const token = this.generateToken(tokenPayload);
      this.sendTokenCookie(res, token);

      ResponseFormatter.success(res, 201, 'User signed up successfully', result);
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.login(req.body);

      const tokenPayload: TokenPayload = {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        organizationId: result.user.organizationId,
      };

      const token = this.generateToken(tokenPayload);
      this.sendTokenCookie(res, token);

      ResponseFormatter.success(res, 200, 'User logged in successfully', result);
    } catch (error) {
      next(error);
    }
  };

  logout = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0),
      });
      ResponseFormatter.success(res, 200, 'User logged out successfully', null);
    } catch (error) {
      next(error);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Unauthorized');
      }

      const profile = await this.authService.getProfile(req.user.email);
      ResponseFormatter.success(res, 200, 'Profile retrieved successfully', profile);
    } catch (error) {
      next(error);
    }
  };
}
