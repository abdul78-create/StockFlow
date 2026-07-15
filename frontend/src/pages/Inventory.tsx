import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Package,
  Search,
  X,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ArrowDownUp,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { LoadingSkeleton } from "../components/ui/LoadingSkeleton";
import { Drawer, DrawerContent, DrawerClose } from "../components/ui/Drawer";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table";
import api from "../lib/api";

interface InventoryBalance {
  id: string;
  quantity: number;
  allocatedQuantity: number;
  product: {
    id: string;
    name: string;
    sku: string;
    unitOfMeasure?: string;
    minimumStock: number;
  };
  warehouse: {
    id: string;
    name: string;
  };
}

interface Warehouse {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
}

type AdjustType = "ADJUSTMENT" | "RECEIVE" | "DISPATCH";
type SortKey = "productName" | "warehouseName" | "quantity";
type SortDir = "asc" | "desc";

function SortIcon({ col, sort }: { col: SortKey; sort: { key: SortKey; dir: SortDir } }) {
  if (sort.key !== col) return <ChevronsUpDown className="w-3 h-3 text-gray-400 inline ml-1" />;
  return sort.dir === "asc"
    ? <ChevronUp className="w-3 h-3 text-blue-600 inline ml-1" />
    : <ChevronDown className="w-3 h-3 text-blue-600 inline ml-1" />;
}

export function Inventory() {
  const [balances, setBalances] = useState<InventoryBalance[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: "productName", dir: "asc" });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Adjust drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [adjustType, setAdjustType] = useState<AdjustType>("ADJUSTMENT");
  const [form, setForm] = useState({
    productId: "",
    warehouseId: "",
    quantity: "",
    notes: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [balanceRes, warehouseRes, productRes] = await Promise.all([
        api.get("/inventory/balances"),
        api.get("/warehouses"),
        api.get("/products"),
      ]);
      setBalances(balanceRes.data.data?.balances || []);
      setWarehouses(warehouseRes.data.data || []);
      setProducts(productRes.data.data?.products || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdjust = (type: AdjustType, balance?: InventoryBalance) => {
    setAdjustType(type);
    setForm({
      productId: balance?.product.id || "",
      warehouseId: balance?.warehouse.id || "",
      quantity: "",
      notes: "",
    });
    setFormErrors({});
    setDrawerOpen(true);
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!form.productId) errors.productId = "Select a product";
    if (!form.warehouseId) errors.warehouseId = "Select a warehouse";
    if (!form.quantity || Number(form.quantity) <= 0) errors.quantity = "Quantity must be positive";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setSubmitting(true);
      if (adjustType === "ADJUSTMENT") {
        await api.post("/inventory/adjust", {
          productId: form.productId,
          warehouseId: form.warehouseId,
          quantityDelta: Number(form.quantity),
          reason: form.notes || "Manual adjustment",
        });
        toast.success("Stock adjusted successfully");
      } else if (adjustType === "RECEIVE") {
        await api.post("/inventory/receive", {
          productId: form.productId,
          warehouseId: form.warehouseId,
          quantity: Number(form.quantity),
          reason: form.notes || "Manual receive",
        });
        toast.success("Stock received successfully");
      } else {
        await api.post("/inventory/dispatch", {
          productId: form.productId,
          warehouseId: form.warehouseId,
          quantity: Number(form.quantity),
          reason: form.notes || "Manual dispatch",
        });
        toast.success("Stock dispatched successfully");
      }
      setDrawerOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update stock");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSort = (key: SortKey) => {
    setSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }
    );
  };

  const filtered = balances
    .filter((b) => {
      const matchSearch =
        b.product.name.toLowerCase().includes(search.toLowerCase()) ||
        b.product.sku.toLowerCase().includes(search.toLowerCase());
      const matchWarehouse = !warehouseFilter || b.warehouse.id === warehouseFilter;
      return matchSearch && matchWarehouse;
    })
    .sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      if (sort.key === "quantity") return (a.quantity - b.quantity) * dir;
      if (sort.key === "warehouseName")
        return a.warehouse.name.localeCompare(b.warehouse.name) * dir;
      return a.product.name.localeCompare(b.product.name) * dir;
    });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const outOfStock = balances.filter((b) => b.quantity <= 0).length;
  const lowStock = balances.filter((b) => b.quantity > 0 && b.quantity <= b.product.minimumStock).length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 md:px-8 pt-8 pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Inventory</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time stock balances across all warehouses.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => openAdjust("DISPATCH")}>
            <ArrowDownUp className="w-4 h-4" />
            Dispatch
          </Button>
          <Button variant="secondary" onClick={() => openAdjust("RECEIVE")}>
            <CheckCircle className="w-4 h-4" />
            Receive
          </Button>
          <Button variant="primary" onClick={() => openAdjust("ADJUSTMENT")}>
            Adjust Stock
          </Button>
        </div>
      </div>

      {/* Stock Alert Banners */}
      {(outOfStock > 0 || lowStock > 0) && !loading && (
        <div className="px-6 md:px-8 pb-4 flex flex-wrap gap-3">
          {outOfStock > 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span className="font-medium">{outOfStock} items out of stock</span>
            </div>
          )}
          {lowStock > 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span className="font-medium">{lowStock} items below minimum stock</span>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 px-6 md:px-8 pb-8 overflow-hidden">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm h-full flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border-b border-gray-200">
            <div className="w-full sm:max-w-xs">
              <Input
                placeholder="Search by product name or SKU…"
                icon={<Search className="w-4 h-4" />}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <select
              value={warehouseFilter}
              onChange={(e) => {
                setWarehouseFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="input-base h-9 w-full sm:w-auto text-sm"
            >
              <option value="">All Warehouses</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
            {(search || warehouseFilter) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { 
                  setSearch(""); 
                  setWarehouseFilter(""); 
                  setCurrentPage(1);
                }}
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={fetchData} className="sm:ml-auto">
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </Button>
            <div className="text-xs text-gray-400 shrink-0">
              {loading ? "" : `${filtered.length} records`}
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(6)].map((_, i) => <LoadingSkeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : error ? (
              <div className="p-8">
                <ErrorState message={error} onRetry={fetchData} />
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={<Package className="w-6 h-6" />}
                title={search || warehouseFilter ? "No records match your filters" : "No inventory records found"}
                description={
                  search || warehouseFilter
                    ? "Try adjusting your filters."
                    : "Receive stock or adjust inventory to see balances here."
                }
                action={
                  !search && !warehouseFilter ? (
                    <Button variant="primary" onClick={() => openAdjust("RECEIVE")}>
                      <CheckCircle className="w-4 h-4" />
                      Receive Stock
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <Table className="data-table">
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("productName")}>
                      Product <SortIcon col="productName" sort={sort} />
                    </TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("warehouseName")}>
                      Warehouse <SortIcon col="warehouseName" sort={sort} />
                    </TableHead>
                    <TableHead className="text-right cursor-pointer select-none" onClick={() => toggleSort("quantity")}>
                      On Hand <SortIcon col="quantity" sort={sort} />
                    </TableHead>
                    <TableHead className="text-right">Allocated</TableHead>
                    <TableHead className="text-right">Available</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence initial={false}>
                    {paginated.map((b) => {
                      const available = b.quantity - (b.allocatedQuantity || 0);
                      const isOutOfStock = b.quantity <= 0;
                      const isLow = !isOutOfStock && b.quantity <= b.product.minimumStock;
                      return (
                        <motion.tr
                          key={b.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <TableCell>
                            <div className="font-medium text-gray-900">{b.product.name}</div>
                            <div className="text-xs text-gray-400 font-mono">{b.product.sku}</div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">{b.warehouse.name}</TableCell>
                          <TableCell className="text-right font-medium text-gray-900">
                            {b.quantity} {b.product.unitOfMeasure}
                          </TableCell>
                          <TableCell className="text-right text-gray-500">
                            {b.allocatedQuantity || 0}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            <span className={available <= 0 ? "text-red-600" : isLow ? "text-yellow-700" : "text-green-700"}>
                              {available}
                            </span>
                          </TableCell>
                          <TableCell>
                            {isOutOfStock ? (
                              <Badge variant="red">Out of Stock</Badge>
                            ) : isLow ? (
                              <Badge variant="yellow">Low Stock</Badge>
                            ) : (
                              <Badge variant="green">In Stock</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openAdjust("ADJUSTMENT", b)}
                            >
                              Adjust
                            </Button>
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </TableBody>
              </Table>
            )}
          </div>
          
          {/* Pagination Controls */}
          {!loading && !error && filtered.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50/50">
              <div className="hidden sm:block text-sm text-gray-500">
                Showing <span className="font-medium text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-gray-900">{Math.min(currentPage * itemsPerPage, filtered.length)}</span> of <span className="font-medium text-gray-900">{filtered.length}</span> results
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-2"
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
                  className="px-2"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Adjust Drawer */}
      <Drawer open={drawerOpen} onOpenChange={(open) => { if (!submitting) setDrawerOpen(open); }}>
        <DrawerContent
          title={
            adjustType === "RECEIVE"
              ? "Receive Stock"
              : adjustType === "DISPATCH"
              ? "Dispatch Stock"
              : "Adjust Stock"
          }
          description={
            adjustType === "RECEIVE"
              ? "Record incoming stock from a supplier or transfer."
              : adjustType === "DISPATCH"
              ? "Record outgoing stock for orders or transfers."
              : "Manually correct stock quantities for a product."
          }
        >
          <form onSubmit={handleSubmit} className="space-y-5 pt-4" noValidate>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Product <span className="text-red-500">*</span>
              </label>
              <select
                value={form.productId}
                onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))}
                className={`input-base h-9 text-sm ${formErrors.productId ? "border-red-400" : ""}`}
              >
                <option value="">Select a product…</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                ))}
              </select>
              {formErrors.productId && <p className="text-xs text-red-600">{formErrors.productId}</p>}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Warehouse <span className="text-red-500">*</span>
              </label>
              <select
                value={form.warehouseId}
                onChange={(e) => setForm((f) => ({ ...f, warehouseId: e.target.value }))}
                className={`input-base h-9 text-sm ${formErrors.warehouseId ? "border-red-400" : ""}`}
              >
                <option value="">Select a warehouse…</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
              {formErrors.warehouseId && <p className="text-xs text-red-600">{formErrors.warehouseId}</p>}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Quantity <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                min="1"
                step="1"
                placeholder="0"
                value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                className={formErrors.quantity ? "border-red-400" : ""}
              />
              {formErrors.quantity && <p className="text-xs text-red-600">{formErrors.quantity}</p>}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Notes (optional)</label>
              <Input
                placeholder="Reason for adjustment…"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <DrawerClose asChild>
                <Button variant="secondary" type="button" disabled={submitting}>Cancel</Button>
              </DrawerClose>
              <Button variant="primary" type="submit" isLoading={submitting}>
                {adjustType === "RECEIVE" ? "Receive Stock" : adjustType === "DISPATCH" ? "Dispatch Stock" : "Apply Adjustment"}
              </Button>
            </div>
          </form>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
