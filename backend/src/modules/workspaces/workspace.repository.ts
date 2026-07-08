import prisma from '../../infra/database/prisma';
import { Organization, OrganizationMember, Invitation } from '@prisma/client';

export class WorkspaceRepository {
  async createWorkspace(userId: string, data: { name: string; industry?: string; timezone?: string; currency?: string; country?: string }) {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          ...data,
          slug: slug || `org-${Date.now()}`,
          ownerId: userId,
        },
      });

      await tx.organizationMember.create({
        data: {
          userId,
          organizationId: org.id,
          role: 'OWNER',
          status: 'ACTIVE',
        },
      });

      // Default STARTER subscription for 1 year
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      
      await tx.subscription.create({
        data: {
          organizationId: org.id,
          plan: 'STARTER',
          status: 'ACTIVE',
          currentPeriodEnd: nextYear,
        },
      });

      // Default Categories
      const categoryNames = ['Electronics', 'Apparel', 'Office Supplies', 'Home Goods', 'Tools'];
      for (const name of categoryNames) {
        await tx.category.create({
          data: {
            name,
            description: `Default ${name} category`,
            organizationId: org.id,
          }
        });
      }

      return org;
    });
  }

  async findWorkspacesByUser(userId: string) {
    return prisma.organizationMember.findMany({
      where: { userId, status: 'ACTIVE' },
      include: { organization: true },
    });
  }

  async findWorkspaceById(id: string) {
    return prisma.organization.findUnique({ where: { id, deletedAt: null } });
  }

  async updateWorkspace(id: string, data: Partial<Organization>) {
    return prisma.organization.update({
      where: { id },
      data,
    });
  }

  async deleteWorkspace(id: string) {
    return prisma.organization.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findMembers(organizationId: string) {
    return prisma.organizationMember.findMany({
      where: { organizationId, status: { not: 'LEFT' }, user: { deletedAt: null } },
      include: { user: true },
    });
  }

  async findMemberById(id: string) {
    return prisma.organizationMember.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  async updateMemberRole(id: string, role: string) {
    return prisma.organizationMember.update({
      where: { id },
      data: { role },
    });
  }

  async removeMember(id: string) {
    return prisma.organizationMember.update({
      where: { id },
      data: { status: 'LEFT' },
    });
  }

  async createInvitation(organizationId: string, email: string, role: string, token: string, invitedBy: string, expiresAt: Date) {
    return prisma.invitation.create({
      data: { organizationId, email, role, token, invitedBy, expiresAt },
    });
  }

  async findInvitations(organizationId: string) {
    return prisma.invitation.findMany({
      where: { organizationId, acceptedAt: null },
    });
  }

  async findInvitationById(id: string) {
    return prisma.invitation.findUnique({ where: { id } });
  }

  async deleteInvitation(id: string) {
    return prisma.invitation.delete({ where: { id } });
  }

  async findInvitationByToken(token: string) {
    return prisma.invitation.findUnique({
      where: { token },
      include: { organization: true },
    });
  }

  async acceptInvitation(invitation: Invitation, userId: string) {
    return prisma.$transaction(async (tx) => {
      await tx.organizationMember.create({
        data: {
          userId,
          organizationId: invitation.organizationId,
          role: invitation.role,
          status: 'ACTIVE',
        },
      });

      await tx.invitation.update({
        where: { id: invitation.id },
        data: { acceptedAt: new Date() },
      });
    });
  }

  async rejectInvitation(invitationId: string) {
    return prisma.invitation.delete({ where: { id: invitationId } });
  }
}
