import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Plus,
  Search,
  X,
  RefreshCw,
  Tag,
  ChevronLeft,
  ChevronRight,
  ArrowRight
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { LoadingSkeleton } from "../components/ui/LoadingSkeleton";
import { Drawer, DrawerContent, DrawerClose } from "../components/ui/Drawer";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table";
import api from "../lib/api";

interface QuotationItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  product: { id: string; name: string; sku: string };
}

interface Quotation {
  id: string;
  quoteNumber: string;
  status: 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  totalAmount: number;
  customer: { id: string; name: string };
  createdAt: string;
  items: QuotationItem[];
}

interface Customer { id: string; name: string; }
interface Product { id: string; name: string; sku: string; sellingPrice: number; }

const STATUS_COLORS = {
  SENT: "bg-blue-50 text-blue-700 border-blue-200",
  ACCEPTED: "bg-green-50 text-green-700 border-green-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
  EXPIRED: "bg-gray-100 text-gray-700 border-gray-200",
};

export function Quotations() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Drawers
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [statusDrawerOpen, setStatusDrawerOpen] = useState(false);
  
  const [selectedQuote, setSelectedQuote] = useState<Quotation | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Forms
  const [customerId, setCustomerId] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [notes, setNotes] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [items, setItems] = useState<{ productId: string; quantity: number; unitPrice: number; discount: number }[]>([]);
  
  const [newStatus, setNewStatus] = useState<'SENT'|'ACCEPTED'|'REJECTED'|'EXPIRED'>('SENT');

  const fetchQuotations = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/quotations");
      setQuotations(res.data.data?.data || (Array.isArray(res.data.data) ? res.data.data : []));
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load quotations");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDependencies = async () => {
    try {
      const [custRes, prodRes] = await Promise.all([
        api.get("/customers"),
        api.get("/products"),
      ]);
      setCustomers(custRes.data.data?.customers || custRes.data.data || []);
      setProducts(prodRes.data.data?.products || prodRes.data.data || []);
    } catch (err) {
      console.error("Failed to load dependencies");
    }
  };

  useEffect(() => { fetchQuotations(); loadDependencies(); }, [fetchQuotations]);

  const openCreate = () => {
    setCustomerId("");
    setDiscountAmount(0);
    setNotes("");
    setValidUntil("");
    setItems([{ productId: "", quantity: 1, unitPrice: 0, discount: 0 }]);
    setCreateDrawerOpen(true);
  };

  const openStatus = (quote: Quotation) => {
    setSelectedQuote(quote);
    setNewStatus(quote.status as any);
    setStatusDrawerOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || items.some(i => !i.productId || i.quantity <= 0)) {
      toast.error("Please fill all required fields correctly.");
      return;
    }
    try {
      setSubmitting(true);
      const payload: any = { customerId, discountAmount, items, notes };
      if (validUntil) {
        payload.validUntil = new Date(validUntil).toISOString();
      }
      await api.post("/quotations", payload);
      toast.success("Quotation created");
      setCreateDrawerOpen(false);
      fetchQuotations();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create Quotation");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuote) return;
    try {
      setSubmitting(true);
      await api.put(`/quotations/${selectedQuote.id}/status`, { status: newStatus });
      toast.success("Status updated");
      setStatusDrawerOpen(false);
      fetchQuotations();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConvert = async (quote: Quotation) => {
    try {
      if (!confirm("Are you sure you want to convert this quotation to a Sales Order?")) return;
      await api.post(`/quotations/${quote.id}/convert`);
      toast.success("Quotation converted to Sales Order");
      fetchQuotations();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to convert Quotation");
    }
  };

  const filtered = quotations.filter((q) =>
    q.quoteNumber?.toLowerCase().includes(search.toLowerCase()) ||
    q.customer?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex flex-col h-full font-sans selection:bg-gray-900 selection:text-white">
      <div className="px-6 md:px-10 pt-8 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Quotations</h1>
          <p className="text-sm text-gray-500 mt-1.5 font-medium">Create and manage customer quotes.</p>
        </div>
        <Button variant="primary" onClick={openCreate} className="shadow-sm">
          <Plus className="w-4 h-4 mr-1.5" />
          Create Quotation
        </Button>
      </div>

      <div className="flex-1 px-6 md:px-10 pb-10 overflow-hidden">
        <div className="bg-white border border-gray-200/60 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] h-full flex flex-col overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-gray-100 bg-gray-50/30">
            <div className="w-full max-w-md relative">
              <Input
                placeholder="Search by Quote Number or Customer…"
                icon={<Search className="w-4 h-4 text-gray-400" />}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-white shadow-sm h-9 text-sm border-gray-200 focus:border-gray-300 focus:ring-0"
              />
              {search && (
                <button onClick={() => { setSearch(""); setCurrentPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-sm">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="ml-auto flex items-center gap-4">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {loading ? "" : `${filtered.length} quotes`}
              </span>
              <button onClick={fetchQuotations} className="text-gray-400 hover:text-gray-600 transition-colors p-1" title="Refresh">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-white">
            {loading ? (
              <div className="p-6 space-y-4">
                {[...Array(5)].map((_, i) => <LoadingSkeleton key={i} className="h-16 w-full rounded-lg" />)}
              </div>
            ) : error ? (
              <div className="p-12"><ErrorState message={error} onRetry={fetchQuotations} /></div>
            ) : filtered.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <EmptyState
                  icon={<Tag className="w-6 h-6 text-gray-400" />}
                  title={search ? "No quotes match your search" : "No quotations yet"}
                  description={search ? "Try adjusting your search terms." : "Create your first quotation for a customer."}
                  action={!search ? <Button variant="primary" onClick={openCreate} className="mt-2">Create Quotation</Button> : undefined}
                />
              </div>
            ) : (
              <Table className="data-table">
                <TableHeader className="bg-gray-50/50 sticky top-0 z-10 backdrop-blur-sm">
                  <TableRow className="border-b border-gray-100">
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quote Details</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence initial={false}>
                    {paginated.map((q) => (
                      <motion.tr
                        key={q.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group"
                      >
                        <TableCell className="pl-6">
                          <div className="font-semibold text-gray-900">{q.quoteNumber}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{new Date(q.createdAt).toLocaleDateString()} · {q.items.length} items</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-gray-700">{q.customer?.name || 'Unknown'}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-bold text-gray-900">₹{Number(q.totalAmount).toFixed(2)}</div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${STATUS_COLORS[q.status]}`}>
                            {q.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm" onClick={() => openStatus(q)} className="h-8 text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-200">
                              Set Status
                            </Button>
                            {q.status === 'ACCEPTED' && (
                              <Button variant="primary" size="sm" onClick={() => handleConvert(q)} className="h-8 text-xs">
                                Convert to SO <ArrowRight className="w-3.5 h-3.5 ml-1" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            )}
          </div>
          
          {/* Pagination Controls */}
          {!loading && !error && filtered.length > 0 && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50/50">
              <div className="hidden sm:block text-sm text-gray-500">
                Showing <span className="font-medium text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-gray-900">{Math.min(currentPage * itemsPerPage, filtered.length)}</span> of <span className="font-medium text-gray-900">{filtered.length}</span> quotes
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-2 h-8"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="text-sm font-medium text-gray-700 px-2">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2 h-8"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CREATE QUOTE DRAWER */}
      <Drawer open={createDrawerOpen} onOpenChange={(open) => !submitting && setCreateDrawerOpen(open)}>
        <DrawerContent title="Create Quotation" description="Draft a new quotation for a customer.">
          <form onSubmit={handleCreateSubmit} className="space-y-6 pt-6">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-900">Customer <span className="text-red-500">*</span></label>
              <select 
                required 
                value={customerId} 
                onChange={e => setCustomerId(e.target.value)}
                className="w-full h-10 px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="">Select Customer</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-900">Items <span className="text-red-500">*</span></label>
                <Button type="button" variant="ghost" size="sm" onClick={() => setItems([...items, { productId: "", quantity: 1, unitPrice: 0, discount: 0 }])} className="text-xs h-7">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Row
                </Button>
              </div>
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div key={idx} className="flex flex-col gap-2 p-3 bg-gray-50 border border-gray-100 rounded-lg">
                    <div className="flex gap-2 items-start">
                      <select
                        required
                        value={item.productId}
                        onChange={(e) => {
                          const pid = e.target.value;
                          const prod = products.find(p => p.id === pid);
                          const newItems = [...items];
                          newItems[idx].productId = pid;
                          if(prod) newItems[idx].unitPrice = prod.sellingPrice || 0;
                          setItems(newItems);
                        }}
                        className="flex-1 h-10 px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                      >
                        <option value="">Select Product</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                      </select>
                      {items.length > 1 && (
                        <Button type="button" variant="ghost" className="px-2 h-10 text-red-500" onClick={() => setItems(items.filter((_, i) => i !== idx))}>
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Input 
                        type="number" min="1" required placeholder="Qty" value={item.quantity || ""} 
                        onChange={e => { const n = [...items]; n[idx].quantity = Number(e.target.value); setItems(n); }} 
                        className="flex-1"
                      />
                      <Input 
                        type="number" min="0" step="0.01" required placeholder="Price" value={item.unitPrice === 0 ? "" : item.unitPrice} 
                        onChange={e => { const n = [...items]; n[idx].unitPrice = Number(e.target.value); setItems(n); }} 
                        className="flex-1"
                      />
                      <Input 
                        type="number" min="0" step="0.01" placeholder="Discount" value={item.discount === 0 ? "" : item.discount} 
                        onChange={e => { const n = [...items]; n[idx].discount = Number(e.target.value); setItems(n); }} 
                        className="flex-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-900">Total Discount</label>
                <Input type="number" min="0" step="0.01" value={discountAmount} onChange={e => setDiscountAmount(Number(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-900">Valid Until</label>
                <Input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-900">Notes / Terms</label>
              <Input placeholder="Enter notes..." value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
            
            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
              <DrawerClose asChild><Button variant="ghost" type="button" disabled={submitting}>Cancel</Button></DrawerClose>
              <Button variant="primary" type="submit" isLoading={submitting}>Create Quotation</Button>
            </div>
          </form>
        </DrawerContent>
      </Drawer>

      {/* UPDATE STATUS DRAWER */}
      <Drawer open={statusDrawerOpen} onOpenChange={(open) => !submitting && setStatusDrawerOpen(open)}>
        <DrawerContent title="Update Status" description={`Update status for ${selectedQuote?.quoteNumber}`}>
          <form onSubmit={handleStatusSubmit} className="space-y-6 pt-6">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-900">New Status</label>
              <select 
                value={newStatus} 
                onChange={e => setNewStatus(e.target.value as any)}
                className="w-full h-10 px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="SENT">Sent</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="REJECTED">Rejected</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
              <DrawerClose asChild><Button variant="ghost" type="button" disabled={submitting}>Cancel</Button></DrawerClose>
              <Button variant="primary" type="submit" isLoading={submitting}>Update</Button>
            </div>
          </form>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
