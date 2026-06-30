import * as React from 'react';
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

interface Workspace {
  id: string;
  name: string;
  plan: string;
}

const workspaces: Workspace[] = [
  {
    id: 'org_1',
    name: 'StockFlow HQ',
    plan: 'Enterprise',
  },
  {
    id: 'org_2',
    name: 'Acme Corp',
    plan: 'Pro',
  },
];

export function WorkspaceSwitcher() {
  const [activeWorkspace, setActiveWorkspace] = React.useState(workspaces[0]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between px-2 py-1.5 hover:bg-transparent hover:text-accent-foreground data-[state=open]:bg-transparent"
        >
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 rounded-md">
              <AvatarFallback className="rounded-md bg-primary text-primary-foreground">
                {activeWorkspace.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start text-sm">
              <span className="font-semibold leading-tight">{activeWorkspace.name}</span>
              <span className="text-xs text-muted-foreground">{activeWorkspace.plan}</span>
            </div>
          </div>
          <Icons.chevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="start">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Workspaces
        </DropdownMenuLabel>
        {workspaces.map((workspace) => (
          <DropdownMenuItem
            key={workspace.id}
            onClick={() => setActiveWorkspace(workspace)}
            className="flex items-center gap-2 p-2"
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
        <DropdownMenuItem className="p-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md border bg-background">
            <Icons.add className="h-4 w-4" />
          </div>
          <span className="ml-2 font-medium">Create Workspace</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
