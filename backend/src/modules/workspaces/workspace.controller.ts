import { Request, Response, NextFunction } from 'express';
import { WorkspaceService } from './workspace.service';
import { ResponseFormatter } from '../../common/responses';
import { UnauthorizedError, ConflictError } from '../../common/errors/app-error';
import prisma from '../../infra/database/prisma';

export class WorkspaceController {
  private service: WorkspaceService;

  constructor(service = new WorkspaceService()) {
    this.service = service;
  }

  createWorkspace = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.createWorkspace(req.user!.id, req.body);
      ResponseFormatter.success(res, 201, 'Workspace created', result);
    } catch (error) { next(error); }
  };

  getWorkspaces = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getWorkspaces(req.user!.id);
      ResponseFormatter.success(res, 200, 'Workspaces retrieved', result);
    } catch (error) { next(error); }
  };

  getWorkspaceDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getWorkspaceDetails(req.workspace!.organizationId);
      ResponseFormatter.success(res, 200, 'Workspace details retrieved', result);
    } catch (error) { next(error); }
  };

  updateWorkspace = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.updateWorkspace(req.workspace!.organizationId, req.body);
      ResponseFormatter.success(res, 200, 'Workspace updated', result);
    } catch (error) { next(error); }
  };

  deleteWorkspace = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.deleteWorkspace(req.workspace!.organizationId);
      ResponseFormatter.success(res, 200, 'Workspace deleted', null);
    } catch (error) { next(error); }
  };

  getMembers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getMembers(req.workspace!.organizationId);
      ResponseFormatter.success(res, 200, 'Members retrieved', result);
    } catch (error) { next(error); }
  };

  updateMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.updateMemberRole(req.workspace!.organizationId, req.params.memberId, req.body.role);
      ResponseFormatter.success(res, 200, 'Member updated', result);
    } catch (error) { next(error); }
  };

  removeMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.removeMember(req.workspace!.organizationId, req.params.memberId);
      ResponseFormatter.success(res, 200, 'Member removed', null);
    } catch (error) { next(error); }
  };

  inviteMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const org = await prisma.organization.findUnique({ where: { id: req.workspace!.organizationId } });
      const result = await this.service.inviteMember(
        req.workspace!.organizationId,
        req.body.email,
        req.body.role,
        req.user!.id,
        org!.name
      );
      ResponseFormatter.success(res, 201, 'Invitation sent', result);
    } catch (error) { next(error); }
  };

  getInvitations = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getInvitations(req.workspace!.organizationId);
      ResponseFormatter.success(res, 200, 'Invitations retrieved', result);
    } catch (error) { next(error); }
  };

  revokeInvitation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.revokeInvitation(req.workspace!.organizationId, req.params.inviteId);
      ResponseFormatter.success(res, 200, 'Invitation revoked', null);
    } catch (error) { next(error); }
  };

  acceptInvitation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError('Must be logged in to accept invitation');
      
      const inv = await prisma.invitation.findUnique({ where: { token: req.body.token }});
      if (inv && inv.email !== req.user.email) {
        throw new ConflictError('This invitation was sent to a different email address');
      }

      const result = await this.service.acceptInvitation(req.body.token, req.user.id);
      ResponseFormatter.success(res, 200, 'Invitation accepted', result);
    } catch (error) { next(error); }
  };

  rejectInvitation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.rejectInvitation(req.body.token);
      ResponseFormatter.success(res, 200, 'Invitation rejected', null);
    } catch (error) { next(error); }
  };
}
