import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Plus,
  Search,
  X,
  Truck,
  RefreshCw,
  Tag
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { LoadingSkeleton } from "../components/ui/LoadingSkeleton";
import { Drawer, DrawerContent, DrawerClose } from "../components/ui/Drawer";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table";
import api from "../lib/api";

interface SOItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  product: { id: string; name: string; sku: string };
}

interface SalesOrder {
  id: string;
  soNumber: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'PACKED' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  customer: { id: string; name: string };
  createdAt: string;
  items: SOItem[];
}

interface Customer { id: string; name: string; }
interface Product { id: string; name: string; sku: string; sellingPrice: number; }
interface Warehouse { id: string; name: string; }

const STATUS_COLORS = {
  DRAFT: "bg-gray-100 text-gray-700 border-gray-200",
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  APPROVED: "bg-blue-50 text-blue-700 border-blue-200",
  PACKED: "bg-purple-50 text-purple-700 border-purple-200",
  DISPATCHED: "bg-indigo-50 text-indigo-700 border-indigo-200",
  DELIVERED: "bg-green-50 text-green-700 border-green-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
};

export function SalesOrders() {
  const [sos, setSos] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  // Drawers
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [dispatchDrawerOpen, setDispatchDrawerOpen] = useState(false);
  const [statusDrawerOpen, setStatusDrawerOpen] = useState(false);
  
  const [selectedSo, setSelectedSo] = useState<SalesOrder | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Forms
  const [customerId, setCustomerId] = useState("");
  const [soNumber, setSoNumber] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [items, setItems] = useState<{ productId: string; quantity: number; unitPrice: number }[]>([]);
  
  const [dispatchWarehouseId, setDispatchWarehouseId] = useState("");
  const [dispatchItems, setDispatchItems] = useState<{ productId: string; quantity: number }[]>([]);
  
  const [newStatus, setNewStatus] = useState<'DRAFT'|'PENDING'|'APPROVED'|'PACKED'|'DISPATCHED'|'DELIVERED'|'CANCELLED'>('PENDING');

  const fetchSOs = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/sales-orders");
      setSos(res.data.data?.salesOrders || res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load sales orders");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDependencies = async () => {
    try {
      const [custRes, prodRes, whRes] = await Promise.all([
        api.get("/customers"),
        api.get("/products"),
        api.get("/warehouses"),
      ]);
      setCustomers(custRes.data.data?.customers || custRes.data.data || []);
      setProducts(prodRes.data.data?.products || prodRes.data.data || []);
      setWarehouses(whRes.data.data?.warehouses || whRes.data.data || []);
    } catch (err) {
      console.error("Failed to load dependencies");
    }
  };

  useEffect(() => { fetchSOs(); loadDependencies(); }, [fetchSOs]);

  const openCreate = () => {
    setSoNumber(`SO-${Date.now().toString().slice(-6)}`);
    setCustomerId("");
    setDiscountAmount(0);
    setItems([{ productId: "", quantity: 1, unitPrice: 0 }]);
    setCreateDrawerOpen(true);
  };

  const openDispatch = (so: SalesOrder) => {
    setSelectedSo(so);
    setDispatchWarehouseId("");
    setDispatchItems(so.items.map(i => ({ productId: i.productId, quantity: i.quantity })));
    setDispatchDrawerOpen(true);
  };

  const openStatus = (so: SalesOrder) => {
    setSelectedSo(so);
    setNewStatus(so.status as any);
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
      await api.post("/sales-orders", { soNumber, customerId, discountAmount, items });
      toast.success("Sales order created");
      setCreateDrawerOpen(false);
      fetchSOs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create SO");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSo) return;
    try {
      setSubmitting(true);
      await api.patch(`/sales-orders/${selectedSo.id}/status`, { status: newStatus });
      toast.success("Status updated");
      setStatusDrawerOpen(false);
      fetchSOs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDispatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSo || !dispatchWarehouseId) {
      toast.error("Please select a warehouse.");
      return;
    }
    try {
      setSubmitting(true);
      await api.post(`/sales-orders/${selectedSo.id}/dispatch`, {
        warehouseId: dispatchWarehouseId,
        items: dispatchItems,
      });
      toast.success("Goods dispatched");
      setDispatchDrawerOpen(false);
      fetchSOs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to dispatch goods");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = sos.filter((s) =>
    s.soNumber?.toLowerCase().includes(search.toLowerCase()) ||
    s.customer?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full font-sans selection:bg-gray-900 selection:text-white">
      <div className="px-6 md:px-10 pt-8 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Sales Orders</h1>
          <p className="text-sm text-gray-500 mt-1.5 font-medium">Manage customer orders and dispatch fulfillment.</p>
        </div>
        <Button variant="primary" onClick={openCreate} className="shadow-sm">
          <Plus className="w-4 h-4 mr-1.5" />
          Create SO
        </Button>
      </div>

      <div className="flex-1 px-6 md:px-10 pb-10 overflow-hidden">
        <div className="bg-white border border-gray-200/60 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] h-full flex flex-col overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-gray-100 bg-gray-50/30">
            <div className="w-full max-w-md relative">
              <Input
                placeholder="Search by SO Number or Customer…"
                icon={<Search className="w-4 h-4 text-gray-400" />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-white shadow-sm h-9 text-sm border-gray-200 focus:border-gray-300 focus:ring-0"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-sm">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="ml-auto flex items-center gap-4">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {loading ? "" : `${filtered.length} orders`}
              </span>
              <button onClick={fetchSOs} className="text-gray-400 hover:text-gray-600 transition-colors p-1" title="Refresh">
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
              <div className="p-12"><ErrorState message={error} onRetry={fetchSOs} /></div>
            ) : filtered.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <EmptyState
                  icon={<Tag className="w-6 h-6 text-gray-400" />}
                  title={search ? "No orders match your search" : "No sales orders yet"}
                  description={search ? "Try adjusting your search terms." : "Create your first SO to sell to customers."}
                  action={!search ? <Button variant="primary" onClick={openCreate} className="mt-2">Create SO</Button> : undefined}
                />
              </div>
            ) : (
              <Table className="data-table">
                <TableHeader className="bg-gray-50/50 sticky top-0 z-10 backdrop-blur-sm">
                  <TableRow className="border-b border-gray-100">
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Order Details</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence initial={false}>
                    {filtered.map((so) => (
                      <motion.tr
                        key={so.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group"
                      >
                        <TableCell className="pl-6">
                          <div className="font-semibold text-gray-900">{so.soNumber}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{new Date(so.createdAt).toLocaleDateString()} · {so.items.length} items</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-gray-700">{so.customer?.name || 'Unknown'}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-bold text-gray-900">₹{Number(so.totalAmount).toFixed(2)}</div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${STATUS_COLORS[so.status]}`}>
                            {so.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {so.status !== 'DELIVERED' && so.status !== 'CANCELLED' && (
                              <Button variant="ghost" size="sm" onClick={() => openStatus(so)} className="h-8 text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-200">
                                Set Status
                              </Button>
                            )}
                            {(so.status === 'APPROVED' || so.status === 'PACKED') && (
                              <Button variant="primary" size="sm" onClick={() => openDispatch(so)} className="h-8 text-xs">
                                <Truck className="w-3.5 h-3.5 mr-1" /> Dispatch
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
        </div>
      </div>

      {/* CREATE SO DRAWER */}
      <Drawer open={createDrawerOpen} onOpenChange={(open) => !submitting && setCreateDrawerOpen(open)}>
        <DrawerContent title="Create Sales Order" description="Raise a new order for a customer.">
          <form onSubmit={handleCreateSubmit} className="space-y-6 pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-900">SO Number</label>
                <Input required value={soNumber} onChange={e => setSoNumber(e.target.value)} />
              </div>
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
                  <div key={idx} className="flex gap-2 items-start">
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
                    <Input 
                      type="number" min="1" required placeholder="Qty" value={item.quantity || ""} 
                      onChange={e => { const n = [...items]; n[idx].quantity = Number(e.target.value); setItems(n); }} 
                      className="w-20"
                    />
                    <Input 
                      type="number" min="0" step="0.01" required placeholder="Price" value={item.unitPrice === 0 ? "" : item.unitPrice} 
                      onChange={e => { const n = [...items]; n[idx].unitPrice = Number(e.target.value); setItems(n); }} 
                      className="w-24"
                    />
                    {items.length > 1 && (
                      <Button type="button" variant="ghost" className="px-2 text-red-500" onClick={() => setItems(items.filter((_, i) => i !== idx))}>
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-900">Discount Amount</label>
              <Input type="number" min="0" step="0.01" value={discountAmount} onChange={e => setDiscountAmount(Number(e.target.value))} />
            </div>
            
            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
              <DrawerClose asChild><Button variant="ghost" type="button" disabled={submitting}>Cancel</Button></DrawerClose>
              <Button variant="primary" type="submit" isLoading={submitting}>Create SO</Button>
            </div>
          </form>
        </DrawerContent>
      </Drawer>

      {/* UPDATE STATUS DRAWER */}
      <Drawer open={statusDrawerOpen} onOpenChange={(open) => !submitting && setStatusDrawerOpen(open)}>
        <DrawerContent title="Update Status" description={`Update status for ${selectedSo?.soNumber}`}>
          <form onSubmit={handleStatusSubmit} className="space-y-6 pt-6">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-900">New Status</label>
              <select 
                value={newStatus} 
                onChange={e => setNewStatus(e.target.value as any)}
                className="w-full h-10 px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="DRAFT">Draft</option>
                <option value="PENDING">Pending (Awaiting Approval)</option>
                <option value="APPROVED">Approved (Confirmed)</option>
                <option value="PACKED">Packed (Ready for Dispatch)</option>
                <option value="DISPATCHED">Dispatched (Shipped)</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
              <DrawerClose asChild><Button variant="ghost" type="button" disabled={submitting}>Cancel</Button></DrawerClose>
              <Button variant="primary" type="submit" isLoading={submitting}>Update</Button>
            </div>
          </form>
        </DrawerContent>
      </Drawer>

      {/* DISPATCH GOODS DRAWER */}
      <Drawer open={dispatchDrawerOpen} onOpenChange={(open) => !submitting && setDispatchDrawerOpen(open)}>
        <DrawerContent title="Dispatch Goods" description={`Deduct inventory for ${selectedSo?.soNumber}`}>
          <form onSubmit={handleDispatchSubmit} className="space-y-6 pt-6">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-900">Source Warehouse <span className="text-red-500">*</span></label>
              <select 
                required 
                value={dispatchWarehouseId} 
                onChange={e => setDispatchWarehouseId(e.target.value)}
                className="w-full h-10 px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="">Select Warehouse</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-900">Quantities to Dispatch</label>
              <div className="space-y-2 border border-gray-200 rounded-md p-1 bg-gray-50">
                {dispatchItems.map((item, idx) => {
                  const soItem = selectedSo?.items.find(i => i.productId === item.productId);
                  return (
                    <div key={idx} className="flex gap-3 items-center bg-white p-2 border border-gray-100 rounded shadow-sm">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{soItem?.product.name}</p>
                        <p className="text-xs text-gray-500">Ordered: {soItem?.quantity}</p>
                      </div>
                      <Input 
                        type="number" min="0" required placeholder="Qty" value={item.quantity === 0 ? "" : item.quantity} 
                        onChange={e => { const n = [...dispatchItems]; n[idx].quantity = Number(e.target.value); setDispatchItems(n); }} 
                        className="w-24 h-8"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
              <DrawerClose asChild><Button variant="ghost" type="button" disabled={submitting}>Cancel</Button></DrawerClose>
              <Button variant="primary" type="submit" isLoading={submitting}>Confirm Dispatch</Button>
            </div>
          </form>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
