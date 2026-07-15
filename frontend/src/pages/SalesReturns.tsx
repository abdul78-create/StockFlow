import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Plus,
  Search,
  X,
  Truck,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { LoadingSkeleton } from "../components/ui/LoadingSkeleton";
import { Drawer, DrawerContent, DrawerClose } from "../components/ui/Drawer";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table";
import api from "../lib/api";

interface SalesReturnItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  product: { id: string; name: string; sku: string };
}

interface SalesReturn {
  id: string;
  returnNumber: string;
  status: 'PENDING' | 'APPROVED' | 'COMPLETED' | 'CANCELLED';
  totalAmount: number;
  customer: { id: string; name: string };
  salesOrder: { id: string; soNumber: string };
  createdAt: string;
  items: SalesReturnItem[];
}

interface Customer { id: string; name: string; }
interface SalesOrder { id: string; soNumber: string; }
interface Product { id: string; name: string; sku: string; sellingPrice: number; }

const STATUS_COLORS = {
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  APPROVED: "bg-blue-50 text-blue-700 border-blue-200",
  COMPLETED: "bg-green-50 text-green-700 border-green-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
};

export function SalesReturns() {
  const [returns, setReturns] = useState<SalesReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Drawers
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Forms
  const [customerId, setCustomerId] = useState("");
  const [salesOrderId, setSalesOrderId] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<{ productId: string; quantity: number; unitPrice: number }[]>([]);

  const fetchReturns = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/sales-returns");
      setReturns(res.data.data?.data || (Array.isArray(res.data.data) ? res.data.data : []));
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load sales returns");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDependencies = async () => {
    try {
      const [custRes, soRes, prodRes] = await Promise.all([
        api.get("/customers"),
        api.get("/sales-orders"),
        api.get("/products"),
      ]);
      setCustomers(custRes.data.data?.customers || custRes.data.data || []);
      setSalesOrders(soRes.data.data?.orders || (Array.isArray(soRes.data.data) ? soRes.data.data : []));
      setProducts(prodRes.data.data?.products || prodRes.data.data || []);
    } catch (err) {
      console.error("Failed to load dependencies");
    }
  };

  useEffect(() => { fetchReturns(); loadDependencies(); }, [fetchReturns]);

  const openCreate = () => {
    setCustomerId("");
    setSalesOrderId("");
    setReason("");
    setNotes("");
    setItems([{ productId: "", quantity: 1, unitPrice: 0 }]);
    setCreateDrawerOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !salesOrderId || items.some(i => !i.productId || i.quantity <= 0)) {
      toast.error("Please fill all required fields correctly.");
      return;
    }
    try {
      setSubmitting(true);
      await api.post("/sales-returns", { customerId, salesOrderId, reason, notes, items });
      toast.success("Sales Return created");
      setCreateDrawerOpen(false);
      fetchReturns();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create return");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAction = async (id: string, action: 'approve' | 'cancel') => {
    try {
      if (!confirm(`Are you sure you want to ${action} this return?`)) return;
      await api.put(`/sales-returns/${id}/${action}`);
      toast.success(`Sales Return ${action}d`);
      fetchReturns();
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Failed to ${action} return`);
    }
  };

  const filtered = returns.filter((r) =>
    r.returnNumber?.toLowerCase().includes(search.toLowerCase()) ||
    r.customer?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex flex-col h-full font-sans selection:bg-gray-900 selection:text-white">
      <div className="px-6 md:px-10 pt-8 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Sales Returns</h1>
          <p className="text-sm text-gray-500 mt-1.5 font-medium">Manage returns received from customers.</p>
        </div>
        <Button variant="primary" onClick={openCreate} className="shadow-sm">
          <Plus className="w-4 h-4 mr-1.5" />
          Create Return
        </Button>
      </div>

      <div className="flex-1 px-6 md:px-10 pb-10 overflow-hidden">
        <div className="bg-white border border-gray-200/60 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] h-full flex flex-col overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-gray-100 bg-gray-50/30">
            <div className="w-full max-w-md relative">
              <Input
                placeholder="Search by Return Number or Customer…"
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
                {loading ? "" : `${filtered.length} returns`}
              </span>
              <button onClick={fetchReturns} className="text-gray-400 hover:text-gray-600 transition-colors p-1" title="Refresh">
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
              <div className="p-12"><ErrorState message={error} onRetry={fetchReturns} /></div>
            ) : filtered.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <EmptyState
                  icon={<Truck className="w-6 h-6 text-gray-400" />}
                  title={search ? "No returns match your search" : "No sales returns yet"}
                  description={search ? "Try adjusting your search terms." : "Create your first sales return for a customer."}
                  action={!search ? <Button variant="primary" onClick={openCreate} className="mt-2">Create Return</Button> : undefined}
                />
              </div>
            ) : (
              <Table className="data-table">
                <TableHeader className="bg-gray-50/50 sticky top-0 z-10 backdrop-blur-sm">
                  <TableRow className="border-b border-gray-100">
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Return Details</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence initial={false}>
                    {paginated.map((r) => (
                      <motion.tr
                        key={r.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group"
                      >
                        <TableCell className="pl-6">
                          <div className="font-semibold text-gray-900">{r.returnNumber}</div>
                          <div className="text-xs text-gray-500 mt-0.5">SO: {r.salesOrder?.soNumber} · {new Date(r.createdAt).toLocaleDateString()}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-gray-700">{r.customer?.name || 'Unknown'}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-bold text-gray-900">₹{Number(r.totalAmount).toFixed(2)}</div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${STATUS_COLORS[r.status]}`}>
                            {r.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {r.status === 'PENDING' && (
                              <>
                                <Button variant="ghost" size="sm" onClick={() => handleAction(r.id, 'approve')} className="h-8 text-xs text-green-600 hover:bg-green-50 hover:text-green-700">
                                  <CheckCircle className="w-4 h-4 mr-1" /> Approve
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleAction(r.id, 'cancel')} className="h-8 text-xs text-red-600 hover:bg-red-50 hover:text-red-700">
                                  <XCircle className="w-4 h-4 mr-1" /> Cancel
                                </Button>
                              </>
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
                Showing <span className="font-medium text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-gray-900">{Math.min(currentPage * itemsPerPage, filtered.length)}</span> of <span className="font-medium text-gray-900">{filtered.length}</span> returns
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-2 h-8"><ChevronLeft className="w-4 h-4" /></Button>
                <div className="text-sm font-medium text-gray-700 px-2">Page {currentPage} of {totalPages}</div>
                <Button variant="ghost" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-2 h-8"><ChevronRight className="w-4 h-4" /></Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CREATE RETURN DRAWER */}
      <Drawer open={createDrawerOpen} onOpenChange={(open) => !submitting && setCreateDrawerOpen(open)}>
        <DrawerContent title="Create Sales Return" description="Process returned items from customer.">
          <form onSubmit={handleCreateSubmit} className="space-y-6 pt-6">
            <div className="grid grid-cols-2 gap-4">
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
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-900">Sales Order <span className="text-red-500">*</span></label>
                <select 
                  required 
                  value={salesOrderId} 
                  onChange={e => setSalesOrderId(e.target.value)}
                  className="w-full h-10 px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option value="">Select SO</option>
                  {salesOrders.map(s => <option key={s.id} value={s.id}>{s.soNumber}</option>)}
                </select>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-900">Items <span className="text-red-500">*</span></label>
                <Button type="button" variant="ghost" size="sm" onClick={() => setItems([...items, { productId: "", quantity: 1, unitPrice: 0 }])} className="text-xs h-7">
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
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-900">Reason</label>
              <Input placeholder="Why is this being returned?" value={reason} onChange={e => setReason(e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-900">Notes / Details</label>
              <Input placeholder="Enter details..." value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
            
            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
              <DrawerClose asChild><Button variant="ghost" type="button" disabled={submitting}>Cancel</Button></DrawerClose>
              <Button variant="primary" type="submit" isLoading={submitting}>Create Return</Button>
            </div>
          </form>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
