import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Role } from '../config/navigation';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  role: Role;
  membershipId: string;
}

interface WorkspaceState {
  activeWorkspaceId: string | null;
  organizations: Organization[];
  setOrganizations: (organizations: Organization[]) => void;
  setActiveWorkspace: (id: string) => void;
  clearWorkspace: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      activeWorkspaceId: null,
      organizations: [],
      
      setOrganizations: (organizations) => {
        set((state) => {
          // If no active workspace or current active doesn't exist in new list, pick the first one
          const hasActive = organizations.find(o => o.id === state.activeWorkspaceId);
          const newActive = hasActive ? state.activeWorkspaceId : (organizations.length > 0 ? organizations[0].id : null);
          return { organizations, activeWorkspaceId: newActive };
        });
      },
      
      setActiveWorkspace: (id) => set({ activeWorkspaceId: id }),
      
      clearWorkspace: () => set({ activeWorkspaceId: null, organizations: [] }),
    }),
    {
      name: 'stockflow-workspace',
    }
  )
);
