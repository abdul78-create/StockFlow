export type Permission =
  | 'workspaces.view'
  | 'workspaces.update'
  | 'workspaces.delete'
  | 'members.view'
  | 'members.invite'
  | 'members.update'
  | 'members.delete'
  | 'products.view'
  | 'products.create'
  | 'products.update'
  | 'products.delete'
  | 'inventory.view'
  | 'inventory.transfer'
  | 'inventory.adjust'
  | 'sales_orders.view'
  | 'sales_orders.create'
  | 'sales_orders.update'
  | 'purchase_orders.view'
  | 'purchase_orders.create'
  | 'purchase_orders.update'
  | 'reports.view'
  | 'reports.export'
  | 'customers.view'
  | 'customers.create'
  | 'customers.update'
  | 'suppliers.view'
  | 'suppliers.create'
  | 'suppliers.update'
  | 'warehouses.view'
  | 'warehouses.create'
  | 'warehouses.update'
  | 'purchase_orders.approve'
  | 'sales_orders.approve';

export type Role = 'OWNER' | 'ADMIN' | 'MANAGER' | 'STAFF';

const STAFF_PERMISSIONS: Permission[] = [
  'products.view',
  'inventory.view',
  'sales_orders.view',
  'sales_orders.create',
  'purchase_orders.view',
  'customers.view',
  'suppliers.view',
  'warehouses.view',
];

const MANAGER_PERMISSIONS: Permission[] = [
  ...STAFF_PERMISSIONS,
  'products.create',
  'products.update',
  'inventory.transfer',
  'inventory.adjust',
  'sales_orders.update',
  'purchase_orders.create',
  'purchase_orders.update',
  'reports.view',
  'reports.export',
  'customers.create',
  'customers.update',
  'suppliers.create',
  'suppliers.update',
  'warehouses.create',
  'warehouses.update',
  'members.view',
];

const ADMIN_PERMISSIONS: Permission[] = [
  ...MANAGER_PERMISSIONS,
  'products.delete',
  'members.invite',
  'members.update',
  'members.delete',
  'workspaces.view',
  'workspaces.update',
  'purchase_orders.approve',
  'sales_orders.approve',
];

const OWNER_PERMISSIONS: Permission[] = [
  ...ADMIN_PERMISSIONS,
  'workspaces.delete',
];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  STAFF: STAFF_PERMISSIONS,
  MANAGER: MANAGER_PERMISSIONS,
  ADMIN: ADMIN_PERMISSIONS,
  OWNER: OWNER_PERMISSIONS,
};

export const hasPermission = (role: string, permission: Permission): boolean => {
  const permissions = ROLE_PERMISSIONS[role as Role];
  if (!permissions) return false;
  return permissions.includes(permission);
};
