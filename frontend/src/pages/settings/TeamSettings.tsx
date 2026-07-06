import * as React from 'react';
import { api } from '@/lib/api';
import { useWorkspaceStore } from '@/store/workspace';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Icons } from '@/lib/icons';
import { formatDistanceToNow } from 'date-fns';
import { MEMBER_ROLE } from '@/lib/enums';


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

export function TeamSettings() {
  const { activeWorkspaceId, organizations } = useWorkspaceStore();
  const [members, setMembers] = React.useState<Member[]>([]);
  const [invitations, setInvitations] = React.useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

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
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspaceId]);

  React.useEffect(() => {
    if (activeWorkspaceId) fetchData();
  }, [fetchData, activeWorkspaceId]);

  const handleRemoveMember = async (memberId: string) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      await api.delete(`/workspaces/members/${memberId}`);
      fetchData();
    } catch (err) {
      alert('Failed to remove member');
    }
  };

  const handleChangeRole = async (memberId: string, newRole: string) => {
    try {
      await api.patch(`/workspaces/members/${memberId}`, { role: newRole });
      fetchData();
    } catch (err) {
      alert('Failed to change role');
    }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    if (!window.confirm('Revoke this invitation?')) return;
    try {
      await api.delete(`/workspaces/invitations/${inviteId}`);
      fetchData();
    } catch (err) {
      alert('Failed to revoke invite');
    }
  };

  if (isLoading) {
    return <div className="flex h-32 items-center justify-center"><Icons.refresh className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

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

      <div className="rounded-md border">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Last Active</th>
              {isAdmin && <th className="px-4 py-3 font-medium text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y">
            {members.map(member => (
              <tr key={member.id} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {member.user.firstName[0]}{member.user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{member.user.firstName} {member.user.lastName}</div>
                      <div className="text-xs text-muted-foreground">{member.user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {isAdmin && member.role !== 'OWNER' ? (
                    <Select defaultValue={member.role} onValueChange={(val) => handleChangeRole(member.id, val)}>
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="MANAGER">Manager</SelectItem>
                        <SelectItem value="STAFF">Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold">
                      {MEMBER_ROLE[member.role] ?? member.role}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full bg-green-500/10 text-green-600 px-2.5 py-0.5 text-xs font-medium">
                    Active
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {member.lastAccessedAt ? formatDistanceToNow(new Date(member.lastAccessedAt), { addSuffix: true }) : 'Never'}
                </td>
                {isAdmin && (
                  <td className="px-4 py-3 text-right">
                    {member.role !== 'OWNER' && (
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive/90 hover:bg-destructive/10" onClick={() => handleRemoveMember(member.id)}>
                        Remove
                      </Button>
                    )}
                  </td>
                )}
              </tr>
            ))}
            
            {/* Pending Invites */}
            {invitations.map(invite => (
              <tr key={invite.id} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-muted text-muted-foreground">
                        {invite.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium italic text-muted-foreground">{invite.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold opacity-50">
                    {MEMBER_ROLE[invite.role] ?? invite.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full bg-orange-500/10 text-orange-600 px-2.5 py-0.5 text-xs font-medium">
                    Pending Invite
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  -
                </td>
                {isAdmin && (
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => handleRevokeInvite(invite.id)}>
                      Revoke
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
