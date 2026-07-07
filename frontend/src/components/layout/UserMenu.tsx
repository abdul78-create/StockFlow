import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../../lib/icons';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useAuthStore } from '../../store/auth';
import { useTheme } from '../theme-provider';

export function UserMenu() {
  const { logout, user } = useAuthStore();
  const initials = user?.email?.substring(0, 2).toUpperCase() || 'U';
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-1 ring-border/50 hover:ring-border transition-all p-0" aria-label="Open user menu">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 text-primary font-medium">{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Admin User</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email || 'User'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem disabled>
            <Icons.user className="mr-2 h-4 w-4" />
            <span>Profile (Soon)</span>
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <Icons.settings className="mr-2 h-4 w-4" />
            <span>Settings (Soon)</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={toggleTheme}>
            {theme === 'light' ? (
              <Icons.moon className="mr-2 h-4 w-4" />
            ) : (
              <Icons.sun className="mr-2 h-4 w-4" />
            )}
            <span>Toggle Theme</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={handleLogout}>
          <Icons.logout className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
