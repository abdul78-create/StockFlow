import * as React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { navigationConfig, NavItem } from '../../config/navigation';
import { filterNavItems } from '../../lib/auth-guard';
import { useAuthStore } from '../../store/auth';
import { useWorkspaceStore } from '../../store/workspace';
import { Icons } from '../../lib/icons';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Settings, HelpCircle, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface SidebarProps {
  isOpen: boolean;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ isOpen, isMobileOpen, onMobileClose }: SidebarProps) {
  const { user } = useAuthStore();
  const { activeWorkspaceId, organizations } = useWorkspaceStore();
  const activeWorkspace = organizations.find(o => o.id === activeWorkspaceId);

  const allowedNav = user && activeWorkspace
    ? filterNavItems(navigationConfig, activeWorkspace.role)
    : [];

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 lg:hidden transition-all duration-300',
          isMobileOpen
            ? 'bg-black/60 backdrop-blur-sm pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        )}
        onClick={onMobileClose}
        aria-hidden="true"
      />

      {/* Sidebar CONTAINER */}
      <aside
        aria-label="Main navigation"
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex h-full flex-col',
          'border-r border-white/5 bg-slate-950/80 backdrop-blur-2xl text-slate-300',
          'transition-[width,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
          // Desktop: animate width
          isOpen ? 'lg:w-[240px]' : 'lg:w-[64px]',
          // Mobile: off-canvas
          isMobileOpen
            ? 'w-[240px] translate-x-0 shadow-2xl'
            : 'w-[240px] -translate-x-full lg:translate-x-0',
        )}
      >
        {/* Top: Logo + Workspace Switcher */}
        <div
          className={cn(
            'flex h-[56px] flex-shrink-0 items-center border-b border-white/5',
            isOpen ? 'px-4' : 'px-0 justify-center'
          )}
        >
          {isOpen ? (
            <WorkspaceSwitcher />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-950 font-bold text-xs tracking-tight shadow-sm hover:scale-105 transition-transform">
              SF
            </div>
          )}
        </div>

        {/* Middle Navigation — scrollable, scrollbar-none */}
        <div className="flex-1 overflow-y-auto sidebar-scroll py-4">
          <nav className="space-y-6 px-3" role="navigation">
            {allowedNav.map((item) =>
              item.isGroup ? (
                <SidebarGroup key={item.title} group={item} isOpen={isOpen} />
              ) : (
                <SidebarItem key={item.title} item={item} isOpen={isOpen} />
              )
            )}
          </nav>
        </div>

        {/* Bottom Dock: Settings, Help, Avatar */}
        <div className="flex-shrink-0 border-t border-white/5 p-3 space-y-1 bg-slate-950/40">
          <SidebarItem
            item={{ title: 'Settings', href: '/settings', icon: 'settings' }}
            isOpen={isOpen}
          />
          <SidebarItem
            item={{ title: 'Help & Docs', href: '/help', icon: 'info' }}
            isOpen={isOpen}
          />
          
          {/* User info bar */}
          <div className={cn(
            'flex items-center gap-3 p-2 rounded-lg border border-transparent transition-all duration-150',
            isOpen ? 'justify-start hover:bg-white/5' : 'justify-center'
          )}>
            <Avatar className="h-6 w-6 border border-white/10">
              <AvatarFallback className="bg-white/5 text-white text-[10px] font-bold uppercase">
                {user?.firstName?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            {isOpen && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[10px] text-slate-500 truncate uppercase tracking-wider font-bold">
                  {activeWorkspace?.role || 'Member'}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

function SidebarGroup({ group, isOpen }: { group: NavItem; isOpen: boolean }) {
  if (group.disabled || !group.children || group.children.length === 0) return null;

  return (
    <div className="space-y-1">
      {isOpen ? (
        <p className="px-3 pb-1.5 text-[9px] font-bold uppercase tracking-widest text-slate-500 select-none">
          {group.title}
        </p>
      ) : (
        <div className="mx-auto mb-1 h-px w-8 bg-white/5" />
      )}
      {group.children.map(child => (
        <SidebarItem key={child.title} item={child} isOpen={isOpen} />
      ))}
    </div>
  );
}

function SidebarItem({ item, isOpen }: { item: NavItem; isOpen: boolean }) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const location = useLocation();
  const Icon = item.icon && item.icon in Icons
    ? Icons[item.icon as keyof typeof Icons]
    : null;

  if (item.disabled) return null;

  // Expandable item with children
  if (item.children) {
    const isAnyChildActive = item.children.some(
      c => c.href && location.pathname.startsWith(c.href)
    );

    return (
      <div className="space-y-1">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'flex items-center w-full px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150',
            isAnyChildActive ? 'text-white bg-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5',
            isOpen ? 'justify-between' : 'justify-center w-9 mx-auto px-0'
          )}
          title={!isOpen ? item.title : undefined}
          aria-expanded={isExpanded}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {Icon && (
              <Icon className={cn('h-4 w-4 flex-shrink-0', isAnyChildActive ? 'text-white' : 'text-slate-400')} />
            )}
            {isOpen && <span className="truncate">{item.title}</span>}
          </div>
          {isOpen && (
            <Icons.chevronDown
              className={cn(
                'h-3.5 w-3.5 flex-shrink-0 text-slate-500 transition-transform duration-200',
                isExpanded && 'rotate-180'
              )}
            />
          )}
        </button>

        {/* Sub-items */}
        <div className={cn(
          'overflow-hidden transition-all duration-200 ease-in-out',
          isExpanded && isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}>
          <div className="space-y-1 pl-9 pr-2 pt-0.5">
            {item.children.map(child => {
              if (child.disabled) return null;
              return (
                <NavLink
                  key={child.title}
                  to={child.href!}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150',
                      isActive
                        ? 'text-white bg-white/10'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    )
                  }
                >
                  {child.title}
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Leaf item
  const linkContent = (
    <NavLink
      to={item.href!}
      className={({ isActive }) =>
        cn(
          'relative flex items-center px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 group',
          isActive
            ? 'text-white bg-white/10 font-bold'
            : 'text-slate-400 hover:text-white hover:bg-white/5',
          isOpen ? 'justify-start' : 'justify-center w-9 mx-auto px-0'
        )
      }
    >
      {({ isActive }) => (
        <>
          {/* Active Left Indicator Pill */}
          {isActive && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-white rounded-r-full" />
          )}

          {Icon && (
            <Icon
              className={cn(
                'h-4 w-4 flex-shrink-0 transition-colors duration-150',
                isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
              )}
            />
          )}
          {isOpen && <span className="truncate ml-2.5">{item.title}</span>}
        </>
      )}
    </NavLink>
  );

  if (!isOpen) {
    return (
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            {linkContent}
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs font-semibold bg-slate-900 border-white/5 text-white">
            {item.title}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return linkContent;
}
