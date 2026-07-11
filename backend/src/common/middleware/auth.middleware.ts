import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../infra/config';
import { UnauthorizedError } from '../errors/app-error';
import { TokenPayload } from '../types';
import prisma from '../../infra/database/prisma';

export const authenticate = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return next(new UnauthorizedError('Authentication token is missing'));
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as TokenPayload;
    
    // Verify session
    const session = await prisma.session.findUnique({
      where: { id: decoded.sessionId }
    });

    if (!session || session.expiresAt < new Date()) {
      return next(new UnauthorizedError('Session expired or invalid'));
    }

    req.user = decoded;

    // Workspace Context
    const orgId = req.headers['x-organization-id'] as string;
    console.log('Middleware received orgId:', orgId, 'for userId:', decoded.id);
    if (orgId) {
      const membership = await prisma.organizationMember.findUnique({
        where: {
          userId_organizationId: {
            userId: decoded.id,
            organizationId: orgId
          }
        }
      });
      console.log('Membership found:', membership?.id, membership?.status);

      if (membership && membership.status === 'ACTIVE') {
        req.workspace = {
          organizationId: membership.organizationId,
          role: membership.role,
          membershipId: membership.id
        };
        
        // Update last accessed
        await prisma.organizationMember.update({
          where: { id: membership.id },
          data: { lastAccessedAt: new Date() }
        }).catch(() => {});
      }
    }

    next();
  } catch (error) {
    next(new UnauthorizedError('Invalid or expired authentication token'));
  }
};

export const requirePermission = (permission: import('../config/permissions').Permission) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('User authentication context not found'));
    }

    if (!req.workspace) {
      return next(new UnauthorizedError('Workspace context required for this action'));
    }

    // require dynamic import here or import at top
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { hasPermission } = require('../config/permissions');

    if (!hasPermission(req.workspace.role, permission)) {
      return next(new UnauthorizedError(`You do not have permission to perform this action (${permission})`));
    }

    next();
  };
};
