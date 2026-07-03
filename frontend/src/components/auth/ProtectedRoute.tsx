import * as React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { Role } from '@/config/navigation';
import { isAuthorized } from '@/lib/auth-guard';
import { Icons } from '@/lib/icons';

import { useWorkspaceStore } from '@/store/workspace';

interface ProtectedRouteProps {
  requiredRoles?: Role[];
}

export function ProtectedRoute({ requiredRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const { activeWorkspaceId, organizations } = useWorkspaceStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <Icons.refresh className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    // Redirect to login but save the attempted url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const activeWorkspace = organizations.find(o => o.id === activeWorkspaceId);
  const currentRole = activeWorkspace?.role;

  if (requiredRoles && requiredRoles.length > 0 && !isAuthorized(currentRole, requiredRoles)) {
    // Role not authorized, redirect to forbidden
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
}
