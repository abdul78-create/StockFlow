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
      { title: 'Reports & Analytics', href: '/reports', icon: 'reports', roles: ['ADMIN', 'MANAGER'] },
    ],
  },
  {
    title: 'Operations',
    isGroup: true,
    children: [
      { title: 'Products', href: '/products', icon: 'products' },
      { title: 'Inventory', href: '/inventory', icon: 'inventory' },
      { title: 'Purchase Orders', href: '/purchase-orders', icon: 'purchaseOrders' },
      { title: 'Sales Orders', href: '/sales-orders', icon: 'salesOrders' },
      { 
        title: 'Returns', 
        icon: 'products',
        children: [
          { title: 'Purchase Returns', href: '/purchase-returns' },
          { title: 'Sales Returns', href: '/sales-returns' }
        ]
      },
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
      { title: 'Invoices', href: '/finance/invoices', icon: 'reports' },
      { title: 'Bills', href: '/finance/bills', icon: 'reports' },
    ],
  },
  {
    title: 'Admin',
    isGroup: true,
    children: [
      { title: 'Team Users', href: '/settings/team', icon: 'users', roles: ['ADMIN'] },
      { title: 'Tax Rules', href: '/settings/tax-rules', icon: 'settings', roles: ['ADMIN'] },
      { title: 'Automation', href: '/settings/automation', icon: 'settings', roles: ['ADMIN'] },
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
