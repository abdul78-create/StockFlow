import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Icons } from '@/lib/icons';
import {
  Plus,
  ShoppingCart,
  FileText,
  UserPlus,
  Truck,
  Warehouse,
  ArrowRight,
} from 'lucide-react';

interface QuickActionItem {
  label: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  bgColor: string;
}

const actions: QuickActionItem[] = [
  {
    label: 'New Product',
    description: 'Add to catalog',
    icon: <Plus className="h-4 w-4" />,
    href: '/products/new',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
  },
  {
    label: 'Purchase Order',
    description: 'Order from supplier',
    icon: <ShoppingCart className="h-4 w-4" />,
    href: '/purchase-orders/new',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/40',
  },
  {
    label: 'Sales Order',
    description: 'Sell to customer',
    icon: <FileText className="h-4 w-4" />,
    href: '/sales-orders/new',
    color: 'text-violet-600 dark:text-violet-400',
    bgColor: 'bg-violet-50 dark:bg-violet-950/40',
  },
  {
    label: 'Add Customer',
    description: 'New CRM entry',
    icon: <UserPlus className="h-4 w-4" />,
    href: '/customers/new',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/40',
  },
  {
    label: 'Add Supplier',
    description: 'New vendor entry',
    icon: <Truck className="h-4 w-4" />,
    href: '/suppliers/new',
    color: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-50 dark:bg-rose-950/40',
  },
  {
    label: 'New Warehouse',
    description: 'Add storage location',
    icon: <Warehouse className="h-4 w-4" />,
    href: '/warehouses/new',
    color: 'text-sky-600 dark:text-sky-400',
    bgColor: 'bg-sky-50 dark:bg-sky-950/40',
  },
];

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[13px] font-semibold text-foreground">Quick Actions</p>
        <span className="text-[11px] text-muted-foreground">Ctrl+K for command palette</span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {actions.map(action => (
          <button
            key={action.label}
            type="button"
            onClick={() => navigate(action.href)}
            className={cn(
              'group flex flex-col items-start gap-2.5 rounded-lg border border-border/50 bg-background p-3',
              'transition-all duration-150 hover:border-border hover:shadow-sm hover:-translate-y-0.5',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'text-left'
            )}
          >
            <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', action.bgColor, action.color)}>
              {action.icon}
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                {action.label}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{action.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
