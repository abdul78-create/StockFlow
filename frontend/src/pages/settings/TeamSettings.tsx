import * as React from 'react';
import { api } from '@/lib/api';
import { useWorkspaceStore } from '@/store/workspace';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Icons } from '@/lib/icons';
import { formatDistanceToNow } from 'date-fns';
import { MEMBER_ROLE } from '@/lib/enums';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface Member {
  id: string; // OrganizationMember ID
  user: { id: string; firstName: string; lastName: string; email: string };
  role: string;
  status: string;
  lastAccessedAt: string | null;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: 'INVITED';
  expiresAt: string;
}

type UnifiedTeamMember = {
  id: string;
  isInvite: boolean;
  name: string;
  email: string;
  initials: string;
  role: string;
  status: string;
  lastActive: string | null;
  rawMember?: Member;
  rawInvite?: Invitation;
};

export function TeamSettings() {
  const { activeWorkspaceId, organizations } = useWorkspaceStore();
  const [members, setMembers] = React.useState<Member[]>([]);
  const [invitations, setInvitations] = React.useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const [memberToRemove, setMemberToRemove] = React.useState<string | null>(null);
  const [inviteToRevoke, setInviteToRevoke] = React.useState<string | null>(null);

  const activeWorkspace = organizations.find(o => o.id === activeWorkspaceId);
  const isOwner = activeWorkspace?.role === 'OWNER';
  const isAdmin = isOwner || activeWorkspace?.role === 'ADMIN';

  const fetchData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const [memRes, invRes] = await Promise.all([
        api.get(`/workspaces/members`),
        api.get(`/workspaces/invitations`)
      ]);
      setMembers(memRes.data?.data || []);
      
      const invData = invRes.data?.data || [];
      // Normalize invitations for display
      setInvitations(invData.map((inv: any) => ({ ...inv, status: 'INVITED' })));
    } catch (err) {
      console.error(err);
      toast.error('Failed to load team data');
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspaceId]);

  React.useEffect(() => {
    if (activeWorkspaceId) fetchData();
  }, [fetchData, activeWorkspaceId]);

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    try {
      await api.delete(`/workspaces/members/${memberToRemove}`);
      toast.success('Member removed');
      fetchData();
    } catch (err) {
      toast.error('Failed to remove member');
    } finally {
      setMemberToRemove(null);
    }
  };

  const handleChangeRole = async (memberId: string, newRole: string) => {
    try {
      await api.patch(`/workspaces/members/${memberId}`, { role: newRole });
      toast.success('Role updated');
      fetchData();
    } catch (err) {
      toast.error('Failed to change role');
    }
  };

  const handleRevokeInvite = async () => {
    if (!inviteToRevoke) return;
    try {
      await api.delete(`/workspaces/invitations/${inviteToRevoke}`);
      toast.success('Invitation revoked');
      fetchData();
    } catch (err) {
      toast.error('Failed to revoke invite');
    } finally {
      setInviteToRevoke(null);
    }
  };

  const unifiedData: UnifiedTeamMember[] = React.useMemo(() => {
    const m = members.map(mem => ({
      id: mem.id,
      isInvite: false,
      name: `${mem.user.firstName} ${mem.user.lastName}`,
      email: mem.user.email,
      initials: `${mem.user.firstName[0] || ''}${mem.user.lastName[0] || ''}`.toUpperCase(),
      role: mem.role,
      status: 'ACTIVE',
      lastActive: mem.lastAccessedAt,
      rawMember: mem,
    }));
    
    const i = invitations.map(inv => ({
      id: inv.id,
      isInvite: true,
      name: inv.email, // Using email as name for invites
      email: inv.email,
      initials: inv.email[0].toUpperCase(),
      role: inv.role,
      status: 'INVITED',
      lastActive: null,
      rawInvite: inv,
    }));
    
    return [...m, ...i];
  }, [members, invitations]);

  const columns: ColumnDef<UnifiedTeamMember>[] = [
    {
      accessorKey: 'name',
      header: 'User',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className={item.isInvite ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}>
                {item.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className={item.isInvite ? "font-medium italic text-muted-foreground" : "font-medium"}>
                {item.isInvite ? item.email : item.name}
              </div>
              {!item.isInvite && <div className="text-xs text-muted-foreground">{item.email}</div>}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => {
        const item = row.original;
        if (item.isInvite) {
          return (
            <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold opacity-50">
              {MEMBER_ROLE[item.role] ?? item.role}
            </span>
          );
        }
        
        if (isAdmin && item.role !== 'OWNER') {
          return (
            <Select defaultValue={item.role} onValueChange={(val) => handleChangeRole(item.id, val)}>
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="MANAGER">Manager</SelectItem>
                <SelectItem value="STAFF">Staff</SelectItem>
              </SelectContent>
            </Select>
          );
        }
        
        return (
          <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold">
            {MEMBER_ROLE[item.role] ?? item.role}
          </span>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const isInvite = row.original.isInvite;
        return isInvite ? (
          <Badge className="bg-orange-500/10 text-orange-600 hover:bg-orange-500/20">Pending Invite</Badge>
        ) : (
          <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Active</Badge>
        );
      },
    },
    {
      accessorKey: 'lastActive',
      header: 'Last Active',
      cell: ({ row }) => {
        const item = row.original;
        if (item.isInvite) return <span className="text-muted-foreground">-</span>;
        return (
          <span className="text-muted-foreground">
            {item.lastActive ? formatDistanceToNow(new Date(item.lastActive), { addSuffix: true }) : 'Never'}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: () => isAdmin ? <div className="text-right">Actions</div> : null,
      cell: ({ row }) => {
        if (!isAdmin) return null;
        const item = row.original;
        
        if (item.isInvite) {
          return (
            <div className="text-right">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => setInviteToRevoke(item.id)}>
                Revoke
              </Button>
            </div>
          );
        }
        
        if (item.role !== 'OWNER') {
          return (
            <div className="text-right">
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive/90 hover:bg-destructive/10" onClick={() => setMemberToRemove(item.id)}>
                Remove
              </Button>
            </div>
          );
        }
        
        return null;
      },
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Team Members</h3>
          <p className="text-sm text-muted-foreground">
            Manage who has access to this workspace.
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => window.location.href = '/onboarding/invite'}>
            <Icons.add className="mr-2 h-4 w-4" />
            Invite Members
          </Button>
        )}
      </div>
      <hr />

      <DataTable
        columns={columns}
        data={unifiedData}
        isLoading={isLoading}
        searchKey="name"
        searchPlaceholder="Search team members..."
        emptyTitle="No members found"
        emptyDescription="Get started by inviting a new member to your workspace."
      />

      <ConfirmDialog
        open={!!memberToRemove}
        onOpenChange={(open) => !open && setMemberToRemove(null)}
        title="Remove Member"
        description="Are you sure you want to remove this member from the workspace? They will lose all access."
        confirmLabel="Remove"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={handleRemoveMember}
      />

      <ConfirmDialog
        open={!!inviteToRevoke}
        onOpenChange={(open) => !open && setInviteToRevoke(null)}
        title="Revoke Invitation"
        description="Are you sure you want to revoke this invitation?"
        confirmLabel="Revoke"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={handleRevokeInvite}
      />
    </div>
  );
}

export default TeamSettings;

