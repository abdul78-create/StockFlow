import { Icons } from '../lib/icons';

export type Role = 'OWNER' | 'ADMIN' | 'MANAGER' | 'STAFF';

export interface NavItem {
  title: string;
  href?: string;
  icon?: keyof typeof Icons;
  roles?: Role[];
  children?: NavItem[];
  isGroup?: boolean;
  disabled?: boolean;
}

export const navigationConfig: NavItem[] = [
  {
    title: 'Overview',
    isGroup: true,
    children: [
      { title: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
      { title: 'Analytics', href: '/analytics', icon: 'reports' },
      { title: 'Reports', href: '/reports', icon: 'reports', roles: ['ADMIN', 'MANAGER'] },
    ],
  },
  {
    title: 'Operations',
    isGroup: true,
    children: [
      { title: 'Products', href: '/products', icon: 'products' },
      { title: 'Inventory', href: '/inventory', icon: 'inventory' },
      { title: 'Purchase', href: '/purchase-orders', icon: 'purchaseOrders' },
      { title: 'Sales', href: '/sales-orders', icon: 'salesOrders' },
      { title: 'Returns', href: '/returns', icon: 'products' },
      { title: 'Warehouses', href: '/warehouses', icon: 'inventory', roles: ['ADMIN', 'MANAGER'] },
    ],
  },
  {
    title: 'CRM',
    isGroup: true,
    children: [
      { title: 'Customers', href: '/customers', icon: 'users' },
      { title: 'Suppliers', href: '/suppliers', icon: 'users' },
    ],
  },
  {
    title: 'Finance',
    isGroup: true,
    children: [
      { title: 'Invoices', href: '/invoices', icon: 'reports' },
      { title: 'Bills', href: '/bills', icon: 'reports' },
      { title: 'Taxes', href: '/taxes', icon: 'settings' },
    ],
  },
  {
    title: 'Admin',
    isGroup: true,
    children: [
      { title: 'Users', href: '/users', icon: 'users', roles: ['ADMIN'] },
      { title: 'Automation', href: '/automation', icon: 'settings', roles: ['ADMIN'] },
      { title: 'Settings', href: '/settings', icon: 'settings', roles: ['ADMIN'] },
    ],
  },
  {
    title: 'Support',
    isGroup: true,
    children: [
      { title: 'Help Center', href: '/help', icon: 'info' },
    ],
  }
];
