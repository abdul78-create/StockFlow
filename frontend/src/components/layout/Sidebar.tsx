import * as React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { navigationConfig, NavItem } from '../../config/navigation';
import { filterNavItems } from '../../lib/auth-guard';
import { useAuthStore } from '../../store/auth';
import { useWorkspaceStore } from '../../store/workspace';
import { Icons } from '../../lib/icons';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface SidebarProps {
  isOpen: boolean;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ isOpen, isMobileOpen, onMobileClose }: SidebarProps) {
  const { user } = useAuthStore();
  const { activeWorkspaceId, organizations } = useWorkspaceStore();
  const activeWorkspace = organizations.find(o => o.id === activeWorkspaceId);
  
  const allowedNav = user && activeWorkspace ? filterNavItems(navigationConfig, activeWorkspace.role) : [];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r bg-background transition-all duration-300 ease-in-out',
          isOpen ? 'w-64' : 'w-20',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex h-14 items-center border-b px-4 py-2">
          {isOpen ? (
            <WorkspaceSwitcher />
          ) : (
            <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">
              SF
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-2">
            {allowedNav.map((item) => (
              <SidebarItem key={item.title} item={item} isOpen={isOpen} />
            ))}
          </nav>
        </div>

        {isMobileOpen && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-3 lg:hidden"
            onClick={onMobileClose}
          >
            <Icons.close className="h-5 w-5" />
          </Button>
        )}
      </aside>
    </>
  );
}

function SidebarItem({ item, isOpen }: { item: NavItem; isOpen: boolean }) {
  const Icon = item.icon ? Icons[item.icon] : null;
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  if (item.disabled) return null;

  if (item.children) {
    return (
      <div className="space-y-1">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground text-muted-foreground',
            isOpen ? 'justify-between' : 'justify-center'
          )}
          title={!isOpen ? item.title : undefined}
        >
          <div className="flex items-center">
            {Icon && <Icon className={cn('h-5 w-5 flex-shrink-0', isOpen && 'mr-3')} />}
            {isOpen && <span>{item.title}</span>}
          </div>
          {isOpen && (
            <Icons.chevronDown
              className={cn('h-4 w-4 transition-transform duration-200', isExpanded ? 'rotate-180' : '')}
            />
          )}
        </button>
        {isExpanded && isOpen && (
          <div className="space-y-1 pl-10 pr-2">
            {item.children.map((child) => {
              if (child.disabled) return null;
              return (
                <NavLink
                  key={child.title}
                  to={child.href!}
                  className={({ isActive }) =>
                    cn(
                      'block rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-muted font-semibold text-foreground'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    )
                  }
                >
                  {child.title}
                </NavLink>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <NavLink
            to={item.href!}
            className={({ isActive }) =>
              cn(
                'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-primary/8 text-primary font-semibold border-l-2 border-primary pl-[10px]'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground border-l-2 border-transparent pl-[10px]',
                isOpen ? 'justify-start' : 'justify-center border-l-0 pl-3'
              )
            }
          >
            {Icon && <Icon className={cn('h-5 w-5 flex-shrink-0', isOpen && 'mr-3')} />}
            {isOpen && (
              <div className="flex flex-1 items-center justify-between">
                <span>{item.title}</span>
              </div>
            )}
          </NavLink>
        </TooltipTrigger>
        {!isOpen && (
          <TooltipContent side="right">
            {item.title}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
