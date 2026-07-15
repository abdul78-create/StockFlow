import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Package,
  Plus,
  Search,
  X,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
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
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table";
import api from "../lib/api";

interface Product {
  id: string;
  name: string;
  sku: string;
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
  costPrice: number;
  sellingPrice: number;
  baseUnit: string;
  minimumStock: number;
  maximumStock: number;
  reorderLevel: number;
  brand: string | null;
  barcode: string | null;
  description: string | null;
  taxRate: number;
  imageUrl: string | null;
  categoryId: string;
  category?: { id: string; name: string };
  supplierId: string | null;
  supplier?: { id: string; companyName: string };
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
}

type SortKey = "name" | "sku" | "sellingPrice" | "status";
type SortDir = "asc" | "desc";

const STATUS_LABELS: Record<string, { label: string; variant: "green" | "gray" | "yellow" }> = {
  ACTIVE: { label: "Active", variant: "green" },
  DRAFT: { label: "Draft", variant: "yellow" },
  ARCHIVED: { label: "Archived", variant: "gray" },
};

function SortIcon({ col, sort }: { col: SortKey; sort: { key: SortKey; dir: SortDir } }) {
  if (sort.key !== col) return <ChevronsUpDown className="w-3 h-3 text-gray-400 inline ml-1" />;
  return sort.dir === "asc"
    ? <ChevronUp className="w-3 h-3 text-blue-600 inline ml-1" />
    : <ChevronDown className="w-3 h-3 text-blue-600 inline ml-1" />;
}

const INITIAL_FORM = {
  name: "",
  sku: "",
  description: "",
  costPrice: "",
  sellingPrice: "",
  minimumStock: "0",
  maximumStock: "100",
  reorderLevel: "0",
  brand: "",
  barcode: "",
  imageUrl: "",
  supplierId: "",
  baseUnit: "pcs",
  taxRate: "18",
  categoryId: "",
  status: "ACTIVE" as "ACTIVE" | "DRAFT" | "ARCHIVED",
};

export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<{ id: string; companyName: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: "name", dir: "asc" });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [productRes, catRes, supplierRes] = await Promise.all([
        api.get("/products"),
        api.get("/categories"),
        api.get("/suppliers"),
      ]);
      setProducts(productRes.data.data?.products || []);
      setCategories(catRes.data.data || []);
      setSuppliers(supplierRes.data.data?.suppliers || supplierRes.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreate = () => {
    setEditingProduct(null);
    setForm(INITIAL_FORM);
    setFormErrors({});
    setDrawerOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setForm({
      name: p.name,
      sku: p.sku,
      description: p.description || "",
      costPrice: String(p.costPrice),
      sellingPrice: String(p.sellingPrice),
      minimumStock: String(p.minimumStock),
      maximumStock: String(p.maximumStock || 100),
      reorderLevel: String(p.reorderLevel || 0),
      brand: p.brand || "",
      barcode: p.barcode || "",
      imageUrl: p.imageUrl || "",
      supplierId: p.supplierId || "",
      baseUnit: p.baseUnit,
      taxRate: String(p.taxRate || 18),
      categoryId: p.categoryId,
      status: p.status,
    });
    setFormErrors({});
    setDrawerOpen(true);
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().length < 2) errors.name = "Name must be at least 2 characters";
    if (!form.sku.trim() || form.sku.trim().length < 3) errors.sku = "SKU must be at least 3 characters";
    if (!form.costPrice || Number(form.costPrice) <= 0) errors.costPrice = "Cost price must be positive";
    if (!form.sellingPrice || Number(form.sellingPrice) <= 0) errors.sellingPrice = "Selling price must be positive";
    if (Number(form.sellingPrice) < Number(form.costPrice)) errors.sellingPrice = "Selling price cannot be less than cost price";
    if (!form.categoryId) errors.categoryId = "Please select a category";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      const payload = {
        name: form.name.trim(),
        sku: form.sku.trim().toUpperCase(),
        description: form.description.trim() || undefined,
        costPrice: Number(form.costPrice),
        sellingPrice: Number(form.sellingPrice),
        minimumStock: Number(form.minimumStock),
        maximumStock: Number(form.maximumStock),
        reorderLevel: Number(form.reorderLevel),
        brand: form.brand.trim() || undefined,
        barcode: form.barcode.trim() || undefined,
        imageUrl: form.imageUrl.trim() || undefined,
        supplierId: form.supplierId || undefined,
        baseUnit: form.baseUnit.trim() || "pcs",
        taxRate: Number(form.taxRate),
        categoryId: form.categoryId,
        status: form.status,
      };

      if (editingProduct) {
        await api.patch(`/products/${editingProduct.id}`, payload);
        toast.success("Product updated successfully");
      } else {
        await api.post("/products", payload);
        toast.success("Product created successfully");
      }
      setDrawerOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await api.delete(`/products/${deleteTarget.id}`);
      toast.success(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete product");
    } finally {
      setDeleting(false);
    }
  };

  const toggleSort = (key: SortKey) => {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" }
    );
  };

  const filtered = products
    .filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase());
      const matchStatus = !statusFilter || p.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      if (sort.key === "sellingPrice") return (a.sellingPrice - b.sellingPrice) * dir;
      return String(a[sort.key]).localeCompare(String(b[sort.key])) * dir;
    });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const field = (
    key: keyof typeof form,
    label: string,
    props: React.InputHTMLAttributes<HTMLInputElement> = {}
  ) => (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label} {props.required && <span className="text-red-500">*</span>}
      </label>
      <Input
        value={form[key] as string}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className={formErrors[key] ? "border-red-400 focus:border-red-400" : ""}
        {...props}
      />
      {formErrors[key] && <p className="text-xs text-red-600">{formErrors[key]}</p>}
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 md:px-8 pt-8 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Products</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your inventory catalog.</p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 md:px-8 pb-8 overflow-hidden">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm h-full flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border-b border-gray-200">
            <div className="w-full sm:max-w-xs">
              <Input
                placeholder="Search by name or SKU…"
                icon={<Search className="w-4 h-4" />}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="input-base h-9 w-full sm:w-auto text-sm"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>
            {(search || statusFilter) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { 
                  setSearch(""); 
                  setStatusFilter(""); 
                  setCurrentPage(1);
                }}
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </Button>
            )}
            <div className="sm:ml-auto text-xs text-gray-400 shrink-0">
              {loading ? "" : `${filtered.length} of ${products.length} products`}
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
                title={search || statusFilter ? "No products match your filters" : "No products found"}
                description={
                  search || statusFilter
                    ? "Try adjusting your search or filter criteria."
                    : "Get started by creating your first product."
                }
                action={
                  !search && !statusFilter ? (
                    <Button variant="primary" onClick={openCreate}>
                      <Plus className="w-4 h-4" />
                      Add Product
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <Table className="data-table">
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("name")}>
                      Product <SortIcon col="name" sort={sort} />
                    </TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("sku")}>
                      SKU <SortIcon col="sku" sort={sort} />
                    </TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right cursor-pointer select-none" onClick={() => toggleSort("sellingPrice")}>
                      Price <SortIcon col="sellingPrice" sort={sort} />
                    </TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("status")}>
                      Status <SortIcon col="status" sort={sort} />
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence initial={false}>
                    {paginated.map((p) => {
                      const s = STATUS_LABELS[p.status];
                      return (
                        <motion.tr
                          key={p.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <TableCell>
                            <div className="font-medium text-gray-900">{p.name}</div>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-gray-500">{p.sku}</TableCell>
                          <TableCell className="text-sm text-gray-600">{p.category?.name || "—"}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <span className="font-bold text-gray-900 text-right inline-block w-16">
                              ₹{Number(p.sellingPrice).toFixed(2)}
                              </span>
                              <span className="text-gray-400 mx-2">/</span>
                              <span className="text-gray-500 text-right inline-block w-16">
                              ₹{Number(p.costPrice).toFixed(2)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={s.variant}>{s.label}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => openEdit(p)}>
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => setDeleteTarget(p)}
                              >
                                Delete
                              </Button>
                            </div>
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

      {/* Create/Edit Drawer */}
      <Drawer open={drawerOpen} onOpenChange={(open) => {
        if (!submitting) setDrawerOpen(open);
      }}>
        <DrawerContent
          title={editingProduct ? "Edit Product" : "Add New Product"}
          description={editingProduct ? "Update the product details below." : "Fill in the details to add a new product to your catalog."}
        >
          <form onSubmit={handleSubmit} className="space-y-5 pt-4" noValidate>
            <div className="grid grid-cols-2 gap-4">
              {field("name", "Product Name", { required: true, placeholder: "e.g. Basmati Rice 5kg" })}
              {field("sku", "SKU", { required: true, placeholder: "e.g. GR-RICE-025" })}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Category */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                  className={`input-base h-9 text-sm ${formErrors.categoryId ? "border-red-400" : ""}`}
                  required
                >
                  <option value="">Select a category…</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {formErrors.categoryId && <p className="text-xs text-red-600">{formErrors.categoryId}</p>}
              </div>

              {/* Supplier */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Supplier</label>
                <select
                  value={form.supplierId}
                  onChange={(e) => setForm((f) => ({ ...f, supplierId: e.target.value }))}
                  className="input-base h-9 text-sm"
                >
                  <option value="">Select a supplier…</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.companyName}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {field("costPrice", "Cost Price (₹)", { required: true, type: "number", step: "0.01", min: "0.01", placeholder: "0.00" })}
              {field("sellingPrice", "Selling Price (₹)", { required: true, type: "number", step: "0.01", min: "0.01", placeholder: "0.00" })}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {field("taxRate", "GST (%)", { type: "number", min: "0", max: "100", step: "0.1", placeholder: "18" })}
              {field("brand", "Brand", { placeholder: "e.g. Tata, Amul, India Gate" })}
            </div>

            <div className="grid grid-cols-3 gap-4">
              {field("minimumStock", "Min. Stock", { type: "number", min: "0", step: "1" })}
              {field("maximumStock", "Max. Stock", { type: "number", min: "0", step: "1" })}
              {field("reorderLevel", "Reorder Level", { type: "number", min: "0", step: "1" })}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {field("barcode", "Barcode", { placeholder: "EAN / UPC code" })}
              {field("baseUnit", "Unit", { placeholder: "pcs, kg, L, pack…" })}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {field("imageUrl", "Image URL", { placeholder: "https://images..." })}
              
              {/* Status */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as typeof form.status }))}
                  className="input-base h-9 text-sm"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="DRAFT">Draft</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="input-base text-sm min-h-[80px] p-2"
                placeholder="Product description..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <DrawerClose asChild>
                <Button variant="secondary" type="button" disabled={submitting}>
                  Cancel
                </Button>
              </DrawerClose>
              <Button variant="primary" type="submit" isLoading={submitting}>
                {editingProduct ? "Save Changes" : "Create Product"}
              </Button>
            </div>
          </form>
        </DrawerContent>
      </Drawer>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Product"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isDestructive
        onConfirm={handleDelete}
        isLoading={deleting}
      />
    </div>
  );
}
