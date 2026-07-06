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
    { id: 'product', label: 'Add your first product', done: false, href: '/products', description: 'Create a product to start tracking inventory' },
    { id: 'supplier', label: 'Add a supplier', done: false, href: '/suppliers', description: 'Set up your first supplier for procurement' },
    { id: 'warehouse', label: 'Create a warehouse', done: false, href: '/warehouses', description: 'Define where your stock is stored' },
    { id: 'customer', label: 'Add a customer', done: false, href: '/customers', description: 'Add your first customer to create sales orders' },
    { id: 'po', label: 'Create a purchase order', done: false, href: '/purchase-orders', description: 'Order stock from a supplier' },
    { id: 'so', label: 'Create a sales order', done: false, href: '/sales-orders', description: 'Sell products to a customer' },
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
          api.get('/purchase-orders?limit=1'),
          api.get('/sales-orders?limit=1'),
        ]);
        setItems(prev => prev.map(item => {
          switch (item.id) {
            case 'product': return { ...item, done: products.data.data?.data?.length > 0 || products.data.data?.length > 0 };
            case 'supplier': return { ...item, done: suppliers.data.data?.data?.length > 0 || suppliers.data.data?.length > 0 };
            case 'warehouse': return { ...item, done: warehouses.data.data?.data?.length > 0 || warehouses.data.data?.length > 0 };
            case 'customer': return { ...item, done: customers.data.data?.data?.length > 0 || customers.data.data?.length > 0 };
            case 'po': return { ...item, done: pos.data.data?.data?.length > 0 || pos.data.data?.length > 0 };
            case 'so': return { ...item, done: sos.data.data?.data?.length > 0 || sos.data.data?.length > 0 };
            default: return item;
          }
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
