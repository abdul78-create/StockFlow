import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';

interface SearchResult {
  products: Array<{ id: string; name: string; sku: string; barcode?: string; imageUrl?: string; sellingPrice: number }>;
  customers: Array<{ id: string; name: string; email?: string; phone?: string }>;
  suppliers: Array<{ id: string; companyName: string; email?: string }>;
  salesOrders: Array<{ id: string; soNumber: string; status: string; totalAmount: number }>;
  purchaseOrders: Array<{ id: string; poNumber: string; status: string; totalAmount: number }>;
  quotations: Array<{ id: string; quoteNumber: string; status: string; totalAmount: number }>;
}

export function useGlobalSearch() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || e.key === '/') {
        e.preventDefault();
        setOpen(o => !o);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  React.useEffect(() => {
    if (!query || query.length < 2) {
      setResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const { data } = await api.get(`/search?q=${encodeURIComponent(query)}`);
        setResults(data.data);
      } catch {
        setResults(null);
      } finally {
        setIsLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const close = () => {
    setOpen(false);
    setQuery('');
    setResults(null);
  };

  const go = (path: string) => {
    navigate(path);
    close();
  };

  return { open, setOpen, query, setQuery, results, isLoading, go, close };
}
