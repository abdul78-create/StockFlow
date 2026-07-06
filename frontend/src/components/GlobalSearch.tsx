import * as React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { Icons } from '@/lib/icons';
import { Badge } from '@/components/ui/badge';

export function GlobalSearch() {
  const { open, setOpen, query, setQuery, results, isLoading, go } = useGlobalSearch();

  const hasResults = results && (
    results.products.length > 0 ||
    results.customers.length > 0 ||
    results.suppliers.length > 0 ||
    results.salesOrders.length > 0 ||
    results.purchaseOrders.length > 0 ||
    results.quotations.length > 0
  );

  return (
    <>
      {/* Trigger button in header */}
      <button
        id="global-search-trigger"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground border border-input rounded-md bg-background hover:bg-accent transition-colors"
      >
        <Icons.search className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
          <span>⌘K</span>
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 max-w-2xl gap-0 overflow-hidden">
          {/* Search input */}
          <div className="flex items-center border-b px-4">
            <Icons.search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              id="global-search-input"
              className="flex h-12 w-full bg-transparent pl-3 text-sm outline-none placeholder:text-muted-foreground"
              placeholder="Search products, customers, orders..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
            />
            {isLoading && <Icons.refresh className="h-4 w-4 animate-spin text-muted-foreground" />}
            <kbd className="ml-2 shrink-0 text-[10px] font-mono text-muted-foreground border rounded px-1.5">ESC</kbd>
          </div>

          {/* Results */}
          <div className="max-h-[400px] overflow-y-auto p-2">
            {!query && (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Type to search products, customers, orders, quotations...
              </div>
            )}

            {query && !hasResults && !isLoading && (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No results for &quot;{query}&quot;
              </div>
            )}

            {hasResults && (
              <div className="space-y-1">
                {results!.products.length > 0 && (
                  <Section label="Products">
                    {results!.products.map(p => (
                      <ResultRow key={p.id} icon="products" label={p.name} sub={p.sku} badge="Product" onClick={() => go(`/products`)} />
                    ))}
                  </Section>
                )}
                {results!.customers.length > 0 && (
                  <Section label="Customers">
                    {results!.customers.map(c => (
                      <ResultRow key={c.id} icon="customers" label={c.name} sub={c.email || ''} badge="Customer" onClick={() => go(`/customers`)} />
                    ))}
                  </Section>
                )}
                {results!.suppliers.length > 0 && (
                  <Section label="Suppliers">
                    {results!.suppliers.map(s => (
                      <ResultRow key={s.id} icon="suppliers" label={s.companyName} sub={s.email || ''} badge="Supplier" onClick={() => go(`/suppliers`)} />
                    ))}
                  </Section>
                )}
                {results!.salesOrders.length > 0 && (
                  <Section label="Sales Orders">
                    {results!.salesOrders.map(o => (
                      <ResultRow key={o.id} icon="salesOrders" label={o.soNumber} sub={o.status} badge="SO" onClick={() => go(`/sales-orders`)} />
                    ))}
                  </Section>
                )}
                {results!.purchaseOrders.length > 0 && (
                  <Section label="Purchase Orders">
                    {results!.purchaseOrders.map(o => (
                      <ResultRow key={o.id} icon="purchaseOrders" label={o.poNumber} sub={o.status} badge="PO" onClick={() => go(`/purchase-orders`)} />
                    ))}
                  </Section>
                )}
                {results!.quotations.length > 0 && (
                  <Section label="Quotations">
                    {results!.quotations.map(q => (
                      <ResultRow key={q.id} icon="finance" label={q.quoteNumber} sub={q.status} badge="Quote" onClick={() => go(`/quotations`)} />
                    ))}
                  </Section>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t px-4 py-2 flex items-center gap-4 text-[11px] text-muted-foreground">
            <span><kbd className="font-mono border rounded px-1">↑↓</kbd> navigate</span>
            <span><kbd className="font-mono border rounded px-1">↵</kbd> select</span>
            <span><kbd className="font-mono border rounded px-1">ESC</kbd> close</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</div>
      {children}
    </div>
  );
}

function ResultRow({ label, sub, badge, onClick, icon }: {
  label: string; sub: string; badge: string; onClick: () => void; icon: string;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-accent text-left transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{label}</div>
        <div className="text-xs text-muted-foreground truncate">{sub}</div>
      </div>
      <Badge variant="secondary" className="shrink-0 text-[10px]">{badge}</Badge>
    </button>
  );
}
