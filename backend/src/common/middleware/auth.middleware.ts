import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../infra/config';
import { UnauthorizedError } from '../errors/app-error';
import { TokenPayload } from '../types';

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const token = req.cookies?.token;

  if (!token) {
    throw new UnauthorizedError('Authentication token is missing');
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as TokenPayload;
    req.user = decoded;
    next();
  } catch (error) {
    next(new UnauthorizedError('Invalid or expired authentication token'));
  }
};

export const authorize = (roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('User authentication context not found');
    }

    if (!roles.includes(req.user.role)) {
      throw new UnauthorizedError('You do not have permission to perform this action');
    }

    next();
  };
};
