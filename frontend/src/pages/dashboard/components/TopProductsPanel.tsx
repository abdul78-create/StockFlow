import * as React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { DashboardMetrics } from '@/lib/hooks/useDashboard';
import { Icons } from '@/lib/icons';
import { ArrowRight, Package } from 'lucide-react';

export function TopProductsPanel({ metrics }: { metrics: DashboardMetrics }) {
  const products = metrics.topProducts ?? [];
  const maxValue = Math.max(...products.map(p => Number(p.stockValue)), 1);

  return (
    <div className="col-span-full lg:col-span-1 rounded-xl border border-border/60 bg-card">
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Top Products</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">By inventory value</p>
        </div>
        <Link
          to="/products"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="px-4 pb-4">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
            <Package className="h-8 w-8 opacity-20" />
            <p className="text-sm font-medium">No products yet</p>
            <Link to="/products/new" className="text-xs text-primary hover:underline flex items-center gap-1">
              Add your first product <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((product, idx) => {
              const pct = (Number(product.stockValue) / maxValue) * 100;
              return (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="group flex items-center gap-3 rounded-lg p-2 -mx-2 hover:bg-muted/40 transition-colors"
                >
                  {/* Rank */}
                  <span className={cn(
                    'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-[11px] font-bold',
                    idx === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400' :
                    idx === 1 ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' :
                    idx === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-400' :
                    'bg-muted text-muted-foreground'
                  )}>
                    {idx + 1}
                  </span>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {product.name}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-1 flex-1 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary/50 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      SKU: {product.sku} · {product.currentStock} in stock
                    </p>
                  </div>

                  {/* Value */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold text-foreground">
                      ${Number(product.stockValue).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
