import { Icons } from '../lib/icons';

export type Role = 'OWNER' | 'ADMIN' | 'MANAGER' | 'STAFF';

export interface NavItem {
  title: string;
  href?: string;
  icon?: keyof typeof Icons;
  roles?: Role[];
  children?: NavItem[];
  disabled?: boolean;
}

export const navigationConfig: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'dashboard',
  },
  {
    title: 'Inventory',
    icon: 'inventory',
    children: [
      {
        title: 'Products',
        href: '/products',
      },
      {
        title: 'Stock Movements',
        href: '/inventory',
      },
      {
        title: 'Cycle Counts',
        href: '/inventory/cycle-counts',
      },
      {
        title: 'Expiring Stock',
        href: '/inventory/expiring',
      },
      {
        title: 'Warehouses',
        href: '/warehouses',
        roles: ['ADMIN', 'MANAGER'],
      },
    ],
  },
  {
    title: 'Purchasing',
    icon: 'purchaseOrders',
    children: [
      {
        title: 'Purchase Orders',
        href: '/purchase-orders',
      },
      {
        title: 'Purchase Returns',
        href: '/purchase-returns',
      },
      {
        title: 'Suppliers',
        href: '/suppliers',
      },
    ],
  },
  {
    title: 'Sales',
    icon: 'salesOrders',
    children: [
      {
        title: 'Sales Orders',
        href: '/sales-orders',
      },
      {
        title: 'Quotations',
        href: '/quotations',
      },
      {
        title: 'Sales Returns',
        href: '/sales-returns',
      },
      {
        title: 'Customers',
        href: '/customers',
      },
    ],
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: 'reports',
    roles: ['ADMIN', 'MANAGER'],
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: 'settings',
    roles: ['ADMIN'],
  },
];
