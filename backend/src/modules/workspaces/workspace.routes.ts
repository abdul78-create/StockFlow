import { Router } from 'express';
import { WorkspaceController } from './workspace.controller';
import { authenticate, requirePermission } from '../../common/middleware/auth.middleware';
import { validateRequest } from '../../common/middleware/validation.middleware';
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  workspaceIdParamSchema,
  memberIdParamSchema,
  updateMemberSchema,
  inviteMemberSchema,
  invitationIdParamSchema,
  acceptInvitationSchema,
} from './workspace.validation';

const router = Router();
const controller = new WorkspaceController();

// Basic CRUD for workspaces (My workspaces)
router.post('/', authenticate, validateRequest({ body: createWorkspaceSchema }), controller.createWorkspace);
router.get('/', authenticate, controller.getWorkspaces);

// Protected by RBAC using requirePermission (assuming workspace middleware handles the x-organization-id context)
// So for workspace endpoints, the user must pass `x-organization-id` matching the workspace they want to manage.

router.get('/details', authenticate, requirePermission('workspaces.view'), controller.getWorkspaceDetails);
router.patch('/details', authenticate, requirePermission('workspaces.update'), validateRequest({ body: updateWorkspaceSchema }), controller.updateWorkspace);
router.delete('/details', authenticate, requirePermission('workspaces.delete'), controller.deleteWorkspace);

// Members
router.get('/members', authenticate, requirePermission('members.view'), controller.getMembers);
router.patch('/members/:memberId', authenticate, requirePermission('members.update'), validateRequest({ params: memberIdParamSchema, body: updateMemberSchema }), controller.updateMember);
router.delete('/members/:memberId', authenticate, requirePermission('members.delete'), validateRequest({ params: memberIdParamSchema }), controller.removeMember);

// Invitations (Manager+)
router.post('/invitations', authenticate, requirePermission('members.invite'), validateRequest({ body: inviteMemberSchema }), controller.inviteMember);
router.get('/invitations', authenticate, requirePermission('members.view'), controller.getInvitations);
router.delete('/invitations/:inviteId', authenticate, requirePermission('members.invite'), validateRequest({ params: invitationIdParamSchema }), controller.revokeInvitation);

// Global invitation actions (No workspace context required, just auth and token)
router.post('/invitations/accept', authenticate, validateRequest({ body: acceptInvitationSchema }), controller.acceptInvitation);
router.post('/invitations/reject', authenticate, validateRequest({ body: acceptInvitationSchema }), controller.rejectInvitation);

export default router;
