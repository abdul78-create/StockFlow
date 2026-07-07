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
          'fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
          isOpen ? 'w-64' : 'w-20',
          isMobileOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full lg:translate-x-0 lg:shadow-none'
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
          <nav className="space-y-6 px-2">
            {allowedNav.map((item) => (
              item.isGroup ? (
                <SidebarGroup key={item.title} group={item} isOpen={isOpen} />
              ) : (
                <SidebarItem key={item.title} item={item} isOpen={isOpen} />
              )
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

function SidebarGroup({ group, isOpen }: { group: NavItem; isOpen: boolean }) {
  if (group.disabled || !group.children || group.children.length === 0) return null;

  return (
    <div className="space-y-1">
      {isOpen && (
        <h4 className="px-3 text-xs font-bold uppercase tracking-wider text-muted-foreground/70 mb-2">
          {group.title}
        </h4>
      )}
      {!isOpen && (
        <div className="mx-auto mb-2 mt-4 h-px w-8 bg-border/50 first:mt-0" />
      )}
      {group.children.map(child => (
        <SidebarItem key={child.title} item={child} isOpen={isOpen} />
      ))}
    </div>
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
                'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                isOpen ? 'justify-start' : 'justify-center'
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
