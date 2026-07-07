import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../../lib/icons';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useWorkspaceStore } from '../../store/workspace';

export function WorkspaceSwitcher() {
  const navigate = useNavigate();
  const { organizations, activeWorkspaceId, setActiveWorkspace } = useWorkspaceStore();
  
  const activeWorkspace = organizations.find((o) => o.id === activeWorkspaceId);

  if (!activeWorkspace) {
    return (
      <Button variant="ghost" onClick={() => navigate('/onboarding/workspace')} className="w-full justify-between">
        Create Workspace
        <Icons.add className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between px-2 py-1.5 hover:bg-muted data-[state=open]:bg-muted/80 rounded-lg transition-all ring-1 ring-inset ring-transparent hover:ring-border/50 data-[state=open]:ring-border/50"
        >
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 rounded-md">
              <AvatarFallback className="rounded-md bg-primary text-primary-foreground">
                {activeWorkspace.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start text-sm">
              <span className="font-semibold leading-tight line-clamp-1 text-left w-32">{activeWorkspace.name}</span>
              <span className="text-xs text-muted-foreground uppercase">{activeWorkspace.role}</span>
            </div>
          </div>
          <Icons.chevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="start">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Workspaces
        </DropdownMenuLabel>
        {organizations.map((workspace) => (
          <DropdownMenuItem
            key={workspace.id}
            onClick={() => setActiveWorkspace(workspace.id)}
            className="flex items-center gap-2 p-2 cursor-pointer"
          >
            <Avatar className="h-6 w-6 rounded-md">
              <AvatarFallback className="rounded-md text-[10px]">
                {workspace.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium leading-none">{workspace.name}</span>
            </div>
            {activeWorkspace.id === workspace.id && (
              <Icons.success className="ml-auto h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => navigate('/onboarding/workspace')}
          className="cursor-pointer text-muted-foreground"
        >
          <Icons.add className="mr-2 h-4 w-4" />
          Create Workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
