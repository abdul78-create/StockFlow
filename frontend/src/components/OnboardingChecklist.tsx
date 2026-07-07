import * as React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';

interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
  href: string;
  description: string;
}

export function OnboardingChecklist() {
  const [items, setItems] = React.useState<ChecklistItem[]>([
    { id: 'workspace', label: 'Create Workspace', done: false, href: '/settings', description: 'Configure your company workspace' },
    { id: 'warehouse', label: 'Add Warehouse', done: false, href: '/settings/warehouses', description: 'Define where your stock is stored' },
    { id: 'categories', label: 'Add Categories', done: false, href: '/products', description: 'Organize products by category' },
    { id: 'product', label: 'Add Products', done: false, href: '/products/new', description: 'Create products to start tracking inventory' },
    { id: 'supplier', label: 'Add Supplier', done: false, href: '/suppliers/new', description: 'Set up your first supplier for procurement' },
    { id: 'customer', label: 'Add Customer', done: false, href: '/customers/new', description: 'Add your first customer to create sales orders' },
    { id: 'po', label: 'Create Purchase Order', done: false, href: '/purchase-orders/new', description: 'Order stock from a supplier' },
    { id: 'receive', label: 'Receive Goods', done: false, href: '/purchase-orders', description: 'Mark a purchase order as delivered' },
    { id: 'so', label: 'Create Sales Order', done: false, href: '/sales-orders/new', description: 'Sell products to a customer' },
    { id: 'setup', label: 'Complete Setup', done: false, href: '/', description: 'You are all set to use StockFlow Enterprise!' },
  ]);
  const [dismissed, setDismissed] = React.useState(() => localStorage.getItem('onboarding_dismissed') === 'true');

  React.useEffect(() => {
    const check = async () => {
      try {
        const [products, suppliers, warehouses, customers, pos, sos] = await Promise.all([
          api.get('/products?limit=1'),
          api.get('/suppliers?limit=1'),
          api.get('/warehouses?limit=1'),
          api.get('/customers?limit=1'),
          api.get('/purchase-orders'),
          api.get('/sales-orders?limit=1'),
        ]);

        const hasProduct = products.data.data?.data?.length > 0 || products.data.data?.length > 0;
        const hasSupplier = suppliers.data.data?.data?.length > 0 || suppliers.data.data?.length > 0;
        const hasWarehouse = warehouses.data.data?.data?.length > 0 || warehouses.data.data?.length > 0;
        const hasCustomer = customers.data.data?.data?.length > 0 || customers.data.data?.length > 0;
        
        const poList = pos.data.data?.data || pos.data.data || [];
        const hasPo = poList.length > 0;
        const hasReceived = poList.some((po: any) => po.status === 'DELIVERED' || po.status === 'COMPLETED');
        
        const hasSo = sos.data.data?.data?.length > 0 || sos.data.data?.length > 0;

        // Categories are implicit for now since we don't have a direct endpoint check here, 
        // we assume if they have a product, they have categories.
        const hasCategories = hasProduct;

        const checks = {
          workspace: true, // Always true if they are logged into the dashboard
          warehouse: hasWarehouse,
          categories: hasCategories,
          product: hasProduct,
          supplier: hasSupplier,
          customer: hasCustomer,
          po: hasPo,
          receive: hasReceived,
          so: hasSo,
        };

        const allCoreDone = checks.warehouse && checks.categories && checks.product && checks.supplier && checks.customer && checks.po && checks.receive && checks.so;

        setItems(prev => prev.map(item => {
          if (item.id === 'setup') return { ...item, done: !!allCoreDone };
          return { ...item, done: !!(checks as any)[item.id] };
        }));
      } catch {
        // silent
      }
    };
    check();
  }, []);

  const completedCount = items.filter(i => i.done).length;
  const allDone = completedCount === items.length;

  if (dismissed || allDone) return null;

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Get started with StockFlow</CardTitle>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{completedCount}/{items.length} complete</span>
            <button
              onClick={() => { setDismissed(true); localStorage.setItem('onboarding_dismissed', 'true'); }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${(completedCount / items.length) * 100}%` }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(item => (
            <Link
              key={item.id}
              to={item.href}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-colors hover:bg-accent ${item.done ? 'opacity-60' : ''}`}
            >
              <div className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${item.done ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                {item.done && (
                  <svg className="h-2.5 w-2.5 text-primary-foreground" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <div>
                <p className="text-sm font-medium leading-tight">{item.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
