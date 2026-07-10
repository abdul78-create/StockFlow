import * as React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Icons } from '../../lib/icons';
import { Button } from '../ui/button';
import { GlobalSearch } from './GlobalSearch';
import { NotificationCenter } from './NotificationCenter';
import { UserMenu } from './UserMenu';
import { CommandPalette } from './CommandPalette';
import { GlobalQuickCreate } from './GlobalQuickCreate';
import { cn } from '../../lib/utils';
import { Menu, ChevronRight } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../ui/breadcrumb';

interface HeaderProps {
  toggleSidebar?: () => void;
  toggleMobileSidebar?: () => void;
  hideSidebarToggle?: boolean;
}

export function Header({
  toggleSidebar,
  toggleMobileSidebar,
  hideSidebarToggle,
}: HeaderProps) {
  const [isCommandOpen, setIsCommandOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const location = useLocation();

  React.useEffect(() => {
    const main = document.getElementById('main-scroll-container') ?? document.querySelector('main');
    if (!main) return;
    const handler = () => setIsScrolled(main.scrollTop > 2);
    main.addEventListener('scroll', handler, { passive: true });
    return () => main.removeEventListener('scroll', handler);
  }, []);

  // Generate dynamic breadcrumbs based on pathname
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-30 flex h-[56px] w-full items-center justify-between px-4 sm:px-5',
          'bg-slate-950/80 backdrop-blur-xl transition-[border-color,box-shadow] duration-200',
          isScrolled
            ? 'border-b border-white/5 shadow-2xl'
            : 'border-b border-transparent'
        )}
      >
        {/* Left: Menu Toggle + Breadcrumbs */}
        <div className="flex items-center gap-3">
          {!hideSidebarToggle && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="hidden lg:flex h-8 w-8 text-slate-400 hover:text-white"
                onClick={toggleSidebar}
                title="Toggle sidebar"
              >
                <Menu className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="flex lg:hidden h-8 w-8 text-slate-400 hover:text-white"
                onClick={toggleMobileSidebar}
                title="Open menu"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Contextual Breadcrumb */}
          <Breadcrumb className="hidden md:block">
            <BreadcrumbList className="text-slate-400">
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/dashboard" className="text-slate-400 hover:text-white text-xs">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {pathnames.map((value, index) => {
                const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                const isLast = index === pathnames.length - 1;
                const formattedName = value.charAt(0).toUpperCase() + value.slice(1).replace('-', ' ');

                return (
                  <React.Fragment key={to}>
                    <BreadcrumbSeparator className="text-slate-600">
                      <ChevronRight className="h-3 w-3" />
                    </BreadcrumbSeparator>
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage className="text-white font-semibold text-xs">{formattedName}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link to={to} className="text-slate-400 hover:text-white text-xs">{formattedName}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Center: Command Search */}
        <div className="hidden sm:flex flex-1 justify-center max-w-md mx-4">
          <GlobalSearch onClick={() => setIsCommandOpen(true)} />
        </div>

        {/* Right: Quick Create + Notifications + User Avatar */}
        <div className="flex items-center gap-2">
          {/* Mobile search trigger */}
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden h-8 w-8 text-slate-400 hover:text-white"
            onClick={() => setIsCommandOpen(true)}
            title="Search"
          >
            <Icons.search className="h-4 w-4" />
          </Button>

          <GlobalQuickCreate />
          
          <div className="h-4 w-px bg-white/10" />

          <NotificationCenter />
          <UserMenu />
        </div>
      </header>

      <CommandPalette open={isCommandOpen} setOpen={setIsCommandOpen} />
    </>
  );
}
