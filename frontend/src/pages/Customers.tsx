import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Users,
  Plus,
  Search,
  X,
  Mail,
  Phone,
  MapPin,
  Pencil,
  Trash2,
  RefreshCw,
  Building,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { LoadingSkeleton } from "../components/ui/LoadingSkeleton";
import { Drawer, DrawerContent, DrawerClose } from "../components/ui/Drawer";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table";
import api from "../lib/api";

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  gst: string | null;
  address: string | null;
  creditLimit: number | null;
  createdAt: string;
}

const INITIAL_FORM = {
  name: "",
  email: "",
  phone: "",
  gst: "",
  address: "",
  creditLimit: "",
};

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/customers");
      setCustomers(res.data.data?.customers || res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const openCreate = () => {
    setEditingCustomer(null);
    setForm(INITIAL_FORM);
    setFormErrors({});
    setDrawerOpen(true);
  };

  const openEdit = (c: Customer) => {
    setEditingCustomer(c);
    setForm({
      name: c.name,
      email: c.email || "",
      phone: c.phone || "",
      gst: c.gst || "",
      address: c.address || "",
      creditLimit: c.creditLimit !== null && c.creditLimit !== undefined ? String(c.creditLimit) : "",
    });
    setFormErrors({});
    setDrawerOpen(true);
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().length < 2) errors.name = "Name must be at least 2 characters";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Invalid email format";
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
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        gst: form.gst.trim() || undefined,
        address: form.address.trim() || undefined,
        creditLimit: form.creditLimit.trim() !== "" ? Number(form.creditLimit) : null,
      };
      
      if (editingCustomer) {
        await api.patch(`/customers/${editingCustomer.id}`, payload);
        toast.success("Customer updated successfully");
      } else {
        await api.post("/customers", payload);
        toast.success("Customer created successfully");
      }
      setDrawerOpen(false);
      fetchCustomers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save customer");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await api.delete(`/customers/${deleteTarget.id}`);
      toast.success(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      fetchCustomers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete customer");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.email || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.gst || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex flex-col h-full font-sans selection:bg-gray-900 selection:text-white">
      {/* Header */}
      <div className="px-6 md:px-10 pt-8 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Customers</h1>
          <p className="text-sm text-gray-500 mt-1.5 font-medium">Manage your customer relationships and contact details.</p>
        </div>
        <Button variant="primary" onClick={openCreate} className="shadow-sm">
          <Plus className="w-4 h-4 mr-1.5" />
          Add Customer
        </Button>
      </div>

      <div className="flex-1 px-6 md:px-10 pb-10 overflow-hidden">
        <div className="bg-white border border-gray-200/60 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] h-full flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-100 bg-gray-50/30">
            <div className="w-full max-w-md relative">
              <Input
                placeholder="Search by name, email, phone, or Tax ID…"
                icon={<Search className="w-4 h-4 text-gray-400" />}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-white shadow-sm h-9 text-sm border-gray-200 focus:border-gray-300 focus:ring-0"
              />
              {search && (
                <button 
                  onClick={() => { setSearch(""); setCurrentPage(1); }} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-sm"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="ml-auto flex items-center gap-4">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {loading ? "" : `${filtered.length} customers`}
              </span>
              <button 
                onClick={fetchCustomers} 
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto bg-white">
            {loading ? (
              <div className="p-6 space-y-4">
                {[...Array(5)].map((_, i) => <LoadingSkeleton key={i} className="h-16 w-full rounded-lg" />)}
              </div>
            ) : error ? (
              <div className="p-12">
                <ErrorState message={error} onRetry={fetchCustomers} />
              </div>
            ) : filtered.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <EmptyState
                  icon={<Users className="w-6 h-6 text-gray-400" />}
                  title={search ? "No customers match your search" : "No customers found"}
                  description={
                    search
                      ? "Try adjusting your search terms."
                      : "Add your first customer to start tracking orders and relationships."
                  }
                  action={
                    !search ? (
                      <Button variant="primary" onClick={openCreate} className="mt-2">
                        Add Customer
                      </Button>
                    ) : undefined
                  }
                />
              </div>
            ) : (
              <Table className="data-table">
                <TableHeader className="bg-gray-50/50 sticky top-0 z-10 backdrop-blur-sm">
                  <TableRow className="border-b border-gray-100">
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tax ID (GST/VAT)</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Credit Limit</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence initial={false}>
                    {paginated.map((c) => (
                      <motion.tr
                        key={c.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group"
                      >
                        <TableCell className="pl-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200/60 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
                              {c.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="font-semibold text-gray-900">{c.name}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1.5">
                            {c.email ? (
                              <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                                <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                {c.email}
                              </div>
                            ) : null}
                            {c.phone ? (
                              <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                                <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                {c.phone}
                              </div>
                            ) : null}
                            {!c.email && !c.phone && <span className="text-sm text-gray-400">—</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          {c.gst ? (
                            <div className="flex items-center gap-2 text-sm font-mono font-medium text-gray-600">
                              <Building className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              {c.gst}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-sm font-semibold text-gray-900 font-mono">
                            {c.creditLimit !== null && c.creditLimit !== undefined ? `₹${Number(c.creditLimit).toLocaleString("en-IN")}` : "—"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {c.address ? (
                            <div className="flex items-start gap-2 text-sm text-gray-600 font-medium max-w-[200px]">
                              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                              <span className="truncate" title={c.address}>{c.address}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(c)} className="h-8 px-2 text-gray-500 hover:text-gray-900">
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-gray-400 hover:text-red-600 hover:bg-red-50"
                              onClick={() => setDeleteTarget(c)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
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
                Showing <span className="font-medium text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-gray-900">{Math.min(currentPage * itemsPerPage, filtered.length)}</span> of <span className="font-medium text-gray-900">{filtered.length}</span> customers
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

      {/* Create/Edit Drawer */}
      <Drawer open={drawerOpen} onOpenChange={(open) => { if (!submitting) setDrawerOpen(open); }}>
        <DrawerContent
          title={editingCustomer ? "Edit Customer" : "Add New Customer"}
          description={
            editingCustomer
              ? "Update customer details and contact info."
              : "Create a new customer profile for orders and invoicing."
          }
        >
          <form onSubmit={handleSubmit} className="space-y-6 pt-6" noValidate>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-900">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <Input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Company or Individual Name"
                className={formErrors.name ? "border-red-400" : ""}
              />
              {formErrors.name && <p className="text-xs font-medium text-red-600">{formErrors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-900">Email Address</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="contact@company.com"
                className={formErrors.email ? "border-red-400" : ""}
              />
              {formErrors.email && <p className="text-xs font-medium text-red-600">{formErrors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-900">Phone Number</label>
              <Input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-900">Tax ID (GST / VAT)</label>
              <Input
                value={form.gst}
                onChange={(e) => setForm((f) => ({ ...f, gst: e.target.value }))}
                placeholder="Tax Identification Number"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-900">Billing / Shipping Address</label>
              <Input
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                placeholder="Full address"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-900">Credit Limit (₹)</label>
              <Input
                type="number"
                value={form.creditLimit}
                onChange={(e) => setForm((f) => ({ ...f, creditLimit: e.target.value }))}
                placeholder="Credit Limit amount in ₹"
              />
            </div>

            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
              <DrawerClose asChild>
                <Button variant="ghost" type="button" disabled={submitting}>Cancel</Button>
              </DrawerClose>
              <Button variant="primary" type="submit" isLoading={submitting}>
                {editingCustomer ? "Save Changes" : "Create Customer"}
              </Button>
            </div>
          </form>
        </DrawerContent>
      </Drawer>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Customer"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Customer"
        isDestructive
        onConfirm={handleDelete}
        isLoading={deleting}
      />
    </div>
  );
}
