import { create } from "zustand";

interface Workspace {
  id: string;
  name: string;
  industry?: string;
  subscription?: {
    plan: "STARTER" | "PRO" | "ENTERPRISE";
  };
}

interface WorkspaceState {
  activeWorkspace: Workspace | null;
  workspaces: Workspace[];
  setActiveWorkspace: (workspace: Workspace | null) => void;
  setWorkspaces: (workspaces: Workspace[]) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  activeWorkspace: null,
  workspaces: [],
  setActiveWorkspace: (workspace) => {
    if (workspace) {
      localStorage.setItem("activeWorkspaceId", workspace.id);
    } else {
      localStorage.removeItem("activeWorkspaceId");
    }
    set({ activeWorkspace: workspace });
  },
  setWorkspaces: (workspaces) => set({ workspaces }),
}));
