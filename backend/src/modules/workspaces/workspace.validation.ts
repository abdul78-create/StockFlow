import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  name: z.string().min(2).max(100),
  industry: z.string().optional(),
  timezone: z.string().optional(),
  currency: z.string().optional(),
  country: z.string().optional(),
});

export const updateWorkspaceSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  industry: z.string().optional(),
  timezone: z.string().optional(),
  currency: z.string().optional(),
  country: z.string().optional(),
});

export const workspaceIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const memberIdParamSchema = z.object({
  id: z.string().uuid(),
  memberId: z.string().uuid(),
});

export const updateMemberSchema = z.object({
  role: z.enum(['OWNER', 'ADMIN', 'MANAGER', 'STAFF']),
});

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'MANAGER', 'STAFF']),
});

export const invitationIdParamSchema = z.object({
  id: z.string().uuid(),
  inviteId: z.string().uuid(),
});

export const acceptInvitationSchema = z.object({
  token: z.string(),
});
