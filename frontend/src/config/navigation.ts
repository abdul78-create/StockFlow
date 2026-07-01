import { Icons } from '../lib/icons';

export type Role = 'ADMIN' | 'MANAGER' | 'USER';

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
        title: 'Warehouses',
        href: '/warehouses',
        roles: ['ADMIN', 'MANAGER'],
        disabled: true,
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
        title: 'Suppliers',
        href: '/suppliers',
        disabled: true,
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
        title: 'Customers',
        href: '/customers',
        disabled: true,
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
    disabled: true,
  },
];
