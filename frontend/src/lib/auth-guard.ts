import { Role } from '../config/navigation';

// Mock user context for now. In Phase 3, this will tie into actual auth state.
export interface CurrentUser {
  id: string;
  email: string;
  role: Role;
  organizationId: string;
}


/**
 * Checks if the user's role is authorized against a list of required roles.
 * @param userRole - The role of the current user
 * @param requiredRoles - The roles required to access a resource. If undefined or empty, access is granted.
 */
export function isAuthorized(userRole?: Role, requiredRoles?: Role[]): boolean {
  if (!requiredRoles || requiredRoles.length === 0) {
    return true; // No specific role required, allow access
  }
  if (!userRole) {
    return false; // User has no role, deny access
  }
  if (userRole === 'OWNER') {
    return true; // OWNER has access to everything
  }
  return requiredRoles.includes(userRole);
}

/**
 * Helper to filter navigation items based on the current user's role.
 * Useful for rendering the sidebar.
 */
export function filterNavItems<T extends { roles?: Role[]; children?: T[] }>(
  items: T[],
  userRole: Role
): T[] {
  return items.reduce<T[]>((filtered, item) => {
    // Check if user is authorized for the current item
    if (isAuthorized(userRole, item.roles)) {
      // If authorized and has children, filter the children too
      if (item.children) {
        const filteredChildren = filterNavItems(item.children, userRole);
        // Only keep the item if it has no children after filtering, or if some children survived
        if (filteredChildren.length > 0) {
          filtered.push({ ...item, children: filteredChildren });
        } else if (item.roles || 'href' in item) {
          // It's a leaf node that doesn't rely on children, or we specifically want to show it
          filtered.push({ ...item, children: undefined });
        }
      } else {
        filtered.push(item);
      }
    }
    return filtered;
  }, []);
}
