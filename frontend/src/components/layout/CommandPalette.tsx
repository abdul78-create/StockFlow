import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { Icons } from '@/lib/icons';
import { navigationConfig } from '@/config/navigation';
import { useTheme } from '@/components/theme-provider';
import { api } from '@/lib/api';

interface SearchResult {
  products: Array<{ id: string; name: string; sku: string; barcode?: string }>;
  customers: Array<{ id: string; name: string; email?: string }>;
  suppliers: Array<{ id: string; companyName: string; email?: string }>;
  salesOrders: Array<{ id: string; soNumber: string; status: string }>;
  purchaseOrders: Array<{ id: string; poNumber: string; status: string }>;
  quotations: Array<{ id: string; quoteNumber: string; status: string }>;
}

export function CommandPalette({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const { setTheme } = useTheme();
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<SearchResult | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, setOpen]);

  React.useEffect(() => {
    if (!query || query.length < 2) {
      setResults(null);
      return;
    }
    const delay = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/search?q=${encodeURIComponent(query)}`);
        setResults(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [query]);

  const runCommand = React.useCallback(
    (command: () => unknown) => {
      setOpen(false);
      setQuery('');
      setResults(null);
      command();
    },
    [setOpen]
  );

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Type a command or search database..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {loading && <div className="p-4 text-center text-sm text-muted-foreground">Searching database...</div>}
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Dynamic Search Results */}
        {results && (
          <>
            {results.products.length > 0 && (
              <CommandGroup heading="Products">
                {results.products.map(p => (
                  <CommandItem key={p.id} value={`product-${p.name}`} onSelect={() => runCommand(() => navigate(`/products/${p.id}`))}>
                    <Icons.products className="mr-2 h-4 w-4" />
                    <span>{p.name} ({p.sku})</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {results.customers.length > 0 && (
              <CommandGroup heading="Customers">
                {results.customers.map(c => (
                  <CommandItem key={c.id} value={`customer-${c.name}`} onSelect={() => runCommand(() => navigate(`/customers/${c.id}`))}>
                    <Icons.customers className="mr-2 h-4 w-4" />
                    <span>{c.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {results.suppliers.length > 0 && (
              <CommandGroup heading="Suppliers">
                {results.suppliers.map(s => (
                  <CommandItem key={s.id} value={`supplier-${s.companyName}`} onSelect={() => runCommand(() => navigate(`/suppliers/${s.id}`))}>
                    <Icons.organization className="mr-2 h-4 w-4" />
                    <span>{s.companyName}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {results.salesOrders.length > 0 && (
              <CommandGroup heading="Sales Orders">
                {results.salesOrders.map(o => (
                  <CommandItem key={o.id} value={`so-${o.soNumber}`} onSelect={() => runCommand(() => navigate(`/sales-orders/${o.id}`))}>
                    <Icons.salesOrders className="mr-2 h-4 w-4" />
                    <span>{o.soNumber} ({o.status})</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {results.purchaseOrders.length > 0 && (
              <CommandGroup heading="Purchase Orders">
                {results.purchaseOrders.map(o => (
                  <CommandItem key={o.id} value={`po-${o.poNumber}`} onSelect={() => runCommand(() => navigate(`/purchase-orders/${o.id}`))}>
                    <Icons.purchaseOrders className="mr-2 h-4 w-4" />
                    <span>{o.poNumber} ({o.status})</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {results.quotations.length > 0 && (
              <CommandGroup heading="Quotations">
                {results.quotations.map(q => (
                  <CommandItem key={q.id} value={`quote-${q.quoteNumber}`} onSelect={() => runCommand(() => navigate(`/quotations/${q.id}`))}>
                    <Icons.reports className="mr-2 h-4 w-4" />
                    <span>{q.quoteNumber} ({q.status})</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            <CommandSeparator />
          </>
        )}

        <CommandGroup heading="Navigation">
          {navigationConfig.filter(item => !item.disabled).map((item) => {
            if (item.children) {
              return item.children.filter(child => !child.disabled).map((child) => (
                <CommandItem
                  key={child.title}
                  value={`Go to ${child.title}`}
                  onSelect={() => runCommand(() => navigate(child.href!))}
                >
                  <Icons.chevronRight className="mr-2 h-4 w-4" />
                  <span>Go to {child.title}</span>
                </CommandItem>
              ));
            }
            return (
              <CommandItem
                key={item.title}
                value={`Go to ${item.title}`}
                onSelect={() => runCommand(() => navigate(item.href!))}
              >
                {item.icon && React.createElement(Icons[item.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>, { className: "mr-2 h-4 w-4" })}
                <span>Go to {item.title}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => runCommand(() => navigate('/products/new'))}>
            <Icons.add className="mr-2 h-4 w-4" />
            <span>Create Product</span>
            <CommandShortcut>P</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/purchase-orders/new'))}>
            <Icons.add className="mr-2 h-4 w-4" />
            <span>Create Purchase Order</span>
            <CommandShortcut>O</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/sales-orders/new'))}>
            <Icons.add className="mr-2 h-4 w-4" />
            <span>Create Sales Order</span>
            <CommandShortcut>S</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/quotations/new'))}>
            <Icons.add className="mr-2 h-4 w-4" />
            <span>Create Quotation</span>
            <CommandShortcut>Q</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Theme">
          <CommandItem onSelect={() => runCommand(() => setTheme('light'))}>
            <Icons.sun className="mr-2 h-4 w-4" />
            <span>Light Mode</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme('dark'))}>
            <Icons.moon className="mr-2 h-4 w-4" />
            <span>Dark Mode</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme('system'))}>
            <Icons.laptop className="mr-2 h-4 w-4" />
            <span>System Theme</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
