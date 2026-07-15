import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ShoppingCart,
  Plus,
  Search,
  X,
  Truck,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { LoadingSkeleton } from "../components/ui/LoadingSkeleton";
import { Drawer, DrawerContent, DrawerClose } from "../components/ui/Drawer";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table";
import api from "../lib/api";

interface POItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  product: { id: string; name: string; sku: string };
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'COMPLETED' | 'CANCELLED';
  totalAmount: number;
  supplier: { id: string; companyName: string };
  createdAt: string;
  items: POItem[];
}

interface Supplier { id: string; companyName: string; }
interface Product { id: string; name: string; sku: string; costPrice: number; }
interface Warehouse { id: string; name: string; }

const STATUS_COLORS = {
  DRAFT: "bg-gray-100 text-gray-700 border-gray-200",
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  APPROVED: "bg-blue-50 text-blue-700 border-blue-200",
  COMPLETED: "bg-green-50 text-green-700 border-green-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
};

export function PurchaseOrders() {
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  // Drawers
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [receiveDrawerOpen, setReceiveDrawerOpen] = useState(false);
  const [statusDrawerOpen, setStatusDrawerOpen] = useState(false);
  
  const [selectedPo, setSelectedPo] = useState<PurchaseOrder | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Forms
  const [supplierId, setSupplierId] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [items, setItems] = useState<{ productId: string; quantity: number; unitPrice: number }[]>([]);
  
  const [receiveWarehouseId, setReceiveWarehouseId] = useState("");
  const [receiveItems, setReceiveItems] = useState<{ productId: string; quantity: number }[]>([]);
  
  const [newStatus, setNewStatus] = useState<'DRAFT'|'PENDING'|'APPROVED'|'CANCELLED'>('PENDING');

  const fetchPOs = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/purchase-orders");
      setPos(res.data.data?.orders || (Array.isArray(res.data.data) ? res.data.data : []));
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load purchase orders");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDependencies = async () => {
    try {
      const [supRes, prodRes, whRes] = await Promise.all([
        api.get("/suppliers"),
        api.get("/products"),
        api.get("/warehouses"),
      ]);
      setSuppliers(supRes.data.data?.suppliers || supRes.data.data || []);
      setProducts(prodRes.data.data?.products || prodRes.data.data || []);
      setWarehouses(whRes.data.data?.warehouses || whRes.data.data || []);
    } catch {
      console.error("Failed to load dependencies");
    }
  };

  useEffect(() => { fetchPOs(); loadDependencies(); }, [fetchPOs]);

  const openCreate = () => {
    setPoNumber(`PO-${Date.now().toString().slice(-6)}`);
    setSupplierId("");
    setItems([{ productId: "", quantity: 1, unitPrice: 0 }]);
    setCreateDrawerOpen(true);
  };

  const openReceive = (po: PurchaseOrder) => {
    setSelectedPo(po);
    setReceiveWarehouseId("");
    setReceiveItems(po.items.map(i => ({ productId: i.productId, quantity: i.quantity })));
    setReceiveDrawerOpen(true);
  };

  const openStatus = (po: PurchaseOrder) => {
    setSelectedPo(po);
    setNewStatus(po.status as any);
    setStatusDrawerOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId || items.some(i => !i.productId || i.quantity <= 0)) {
      toast.error("Please fill all required fields correctly.");
      return;
    }
    try {
      setSubmitting(true);
      await api.post("/purchase-orders", { poNumber, supplierId, items });
      toast.success("Purchase order created");
      setCreateDrawerOpen(false);
      fetchPOs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create PO");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPo) return;
    try {
      setSubmitting(true);
      await api.patch(`/purchase-orders/${selectedPo.id}/status`, { status: newStatus });
      toast.success("Status updated");
      setStatusDrawerOpen(false);
      fetchPOs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReceiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPo || !receiveWarehouseId) {
      toast.error("Please select a warehouse.");
      return;
    }
    try {
      setSubmitting(true);
      await api.post(`/purchase-orders/${selectedPo.id}/receive`, {
        warehouseId: receiveWarehouseId,
        items: receiveItems,
      });
      toast.success("Goods received into inventory");
      setReceiveDrawerOpen(false);
      fetchPOs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to receive goods");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = pos.filter((p) =>
    p.poNumber?.toLowerCase().includes(search.toLowerCase()) ||
    p.supplier?.companyName?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex flex-col h-full font-sans selection:bg-gray-900 selection:text-white">
      <div className="px-6 md:px-10 pt-8 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Purchase Orders</h1>
          <p className="text-sm text-gray-500 mt-1.5 font-medium">Manage restocking and supplier purchase workflows.</p>
        </div>
        <Button variant="primary" onClick={openCreate} className="shadow-sm">
          <Plus className="w-4 h-4 mr-1.5" />
          Create PO
        </Button>
      </div>

      <div className="flex-1 px-6 md:px-10 pb-10 overflow-hidden">
        <div className="bg-white border border-gray-200/60 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] h-full flex flex-col overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-gray-100 bg-gray-50/30">
            <div className="w-full max-w-md relative">
              <Input
                placeholder="Search by PO Number or Supplier…"
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
                {loading ? "" : `${filtered.length} orders`}
              </span>
              <button onClick={fetchPOs} className="text-gray-400 hover:text-gray-600 transition-colors p-1" title="Refresh">
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
              <div className="p-12"><ErrorState message={error} onRetry={fetchPOs} /></div>
            ) : filtered.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <EmptyState
                  icon={<ShoppingCart className="w-6 h-6 text-gray-400" />}
                  title={search ? "No orders match your search" : "No purchase orders yet"}
                  description={search ? "Try adjusting your search terms." : "Create your first PO to restock inventory."}
                  action={!search ? <Button variant="primary" onClick={openCreate} className="mt-2">Create PO</Button> : undefined}
                />
              </div>
            ) : (
              <Table className="data-table">
                <TableHeader className="bg-gray-50/50 sticky top-0 z-10 backdrop-blur-sm">
                  <TableRow className="border-b border-gray-100">
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Order Details</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Supplier</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence initial={false}>
                    {paginated.map((po) => (
                      <motion.tr
                        key={po.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group"
                      >
                        <TableCell className="pl-6">
                          <div className="font-semibold text-gray-900">{po.poNumber}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{new Date(po.createdAt).toLocaleDateString()} · {po.items.length} items</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-gray-700">{po.supplier?.companyName || 'Unknown'}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-bold text-gray-900">₹{Number(po.totalAmount).toFixed(2)}</div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${STATUS_COLORS[po.status]}`}>
                            {po.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {po.status !== 'COMPLETED' && po.status !== 'CANCELLED' && (
                              <Button variant="ghost" size="sm" onClick={() => openStatus(po)} className="h-8 text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-200">
                                Set Status
                              </Button>
                            )}
                            {po.status === 'APPROVED' && (
                              <Button variant="primary" size="sm" onClick={() => openReceive(po)} className="h-8 text-xs">
                                <Truck className="w-3.5 h-3.5 mr-1" /> Receive
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
                Showing <span className="font-medium text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-gray-900">{Math.min(currentPage * itemsPerPage, filtered.length)}</span> of <span className="font-medium text-gray-900">{filtered.length}</span> orders
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

      {/* CREATE PO DRAWER */}
      <Drawer open={createDrawerOpen} onOpenChange={(open) => !submitting && setCreateDrawerOpen(open)}>
        <DrawerContent title="Create Purchase Order" description="Raise a new order to a supplier.">
          <form onSubmit={handleCreateSubmit} className="space-y-6 pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-900">PO Number</label>
                <Input required value={poNumber} onChange={e => setPoNumber(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-900">Supplier <span className="text-red-500">*</span></label>
                <select 
                  required 
                  value={supplierId} 
                  onChange={e => setSupplierId(e.target.value)}
                  className="w-full h-10 px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.companyName}</option>)}
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
                        if(prod) newItems[idx].unitPrice = prod.costPrice;
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
            
            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
              <DrawerClose asChild><Button variant="ghost" type="button" disabled={submitting}>Cancel</Button></DrawerClose>
              <Button variant="primary" type="submit" isLoading={submitting}>Create PO</Button>
            </div>
          </form>
        </DrawerContent>
      </Drawer>

      {/* UPDATE STATUS DRAWER */}
      <Drawer open={statusDrawerOpen} onOpenChange={(open) => !submitting && setStatusDrawerOpen(open)}>
        <DrawerContent title="Update Status" description={`Update status for ${selectedPo?.poNumber}`}>
          <form onSubmit={handleStatusSubmit} className="space-y-6 pt-6">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-900">New Status</label>
              <select 
                value={newStatus} 
                onChange={e => setNewStatus(e.target.value as any)}
                className="w-full h-10 px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="DRAFT">Draft</option>
                <option value="PENDING">Pending (Sent to Supplier)</option>
                <option value="APPROVED">Approved (Confirmed)</option>
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

      {/* RECEIVE GOODS DRAWER */}
      <Drawer open={receiveDrawerOpen} onOpenChange={(open) => !submitting && setReceiveDrawerOpen(open)}>
        <DrawerContent title="Receive Goods" description={`Record inventory received for ${selectedPo?.poNumber}`}>
          <form onSubmit={handleReceiveSubmit} className="space-y-6 pt-6">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-900">Destination Warehouse <span className="text-red-500">*</span></label>
              <select 
                required 
                value={receiveWarehouseId} 
                onChange={e => setReceiveWarehouseId(e.target.value)}
                className="w-full h-10 px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="">Select Warehouse</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-900">Quantities Received</label>
              <div className="space-y-2 border border-gray-200 rounded-md p-1 bg-gray-50">
                {receiveItems.map((item, idx) => {
                  const poItem = selectedPo?.items.find(i => i.productId === item.productId);
                  return (
                    <div key={idx} className="flex gap-3 items-center bg-white p-2 border border-gray-100 rounded shadow-sm">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{poItem?.product.name}</p>
                        <p className="text-xs text-gray-500">Ordered: {poItem?.quantity}</p>
                      </div>
                      <Input 
                        type="number" min="0" required placeholder="Qty" value={item.quantity === 0 ? "" : item.quantity} 
                        onChange={e => { const n = [...receiveItems]; n[idx].quantity = Number(e.target.value); setReceiveItems(n); }} 
                        className="w-24 h-8"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
              <DrawerClose asChild><Button variant="ghost" type="button" disabled={submitting}>Cancel</Button></DrawerClose>
              <Button variant="primary" type="submit" isLoading={submitting}>Confirm Receipt</Button>
            </div>
          </form>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
