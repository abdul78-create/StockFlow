import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Factory, Plus, Search, X, MapPin, Pencil, Trash2, RefreshCw } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { LoadingSkeleton } from "../components/ui/LoadingSkeleton";
import { Drawer, DrawerContent, DrawerClose } from "../components/ui/Drawer";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table";
import api from "../lib/api";

interface Warehouse {
  id: string;
  name: string;
  address?: string;
  createdAt: string;
}

const INITIAL_FORM = { name: "", address: "" };

export function Warehouses() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Warehouse | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchWarehouses = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/warehouses");
      setWarehouses(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load warehouses");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWarehouses(); }, [fetchWarehouses]);

  const openCreate = () => {
    setEditingWarehouse(null);
    setForm(INITIAL_FORM);
    setFormErrors({});
    setDrawerOpen(true);
  };

  const openEdit = (w: Warehouse) => {
    setEditingWarehouse(w);
    setForm({ name: w.name, address: w.address || "" });
    setFormErrors({});
    setDrawerOpen(true);
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().length < 2) errors.name = "Name must be at least 2 characters";
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
        address: form.address.trim() || undefined,
      };
      if (editingWarehouse) {
        await api.patch(`/warehouses/${editingWarehouse.id}`, payload);
        toast.success("Warehouse updated successfully");
      } else {
        await api.post("/warehouses", payload);
        toast.success("Warehouse created successfully");
      }
      setDrawerOpen(false);
      fetchWarehouses();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save warehouse");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await api.delete(`/warehouses/${deleteTarget.id}`);
      toast.success(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      fetchWarehouses();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete warehouse");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = warehouses.filter((w) =>
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    (w.address || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 md:px-8 pt-8 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Warehouses</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your physical storage locations.</p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          <Plus className="w-4 h-4" />
          Add Warehouse
        </Button>
      </div>

      <div className="flex-1 px-6 md:px-8 pb-8 overflow-hidden">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm h-full flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-200">
            <div className="w-full max-w-xs">
              <Input
                placeholder="Search warehouses…"
                icon={<Search className="w-4 h-4" />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {search && (
              <Button variant="ghost" size="sm" onClick={() => setSearch("")}>
                <X className="w-3.5 h-3.5" /> Clear
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={fetchWarehouses} className="ml-auto">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </Button>
            <span className="text-xs text-gray-400 shrink-0">
              {loading ? "" : `${filtered.length} warehouses`}
            </span>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(4)].map((_, i) => <LoadingSkeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : error ? (
              <div className="p-8">
                <ErrorState message={error} onRetry={fetchWarehouses} />
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={<Factory className="w-6 h-6" />}
                title={search ? "No warehouses match your search" : "No warehouses found"}
                description={
                  search
                    ? "Try a different search term."
                    : "You haven't created any warehouses yet. Add one to start tracking inventory."
                }
                action={
                  !search ? (
                    <Button variant="primary" onClick={openCreate}>
                      <Plus className="w-4 h-4" />
                      Add Warehouse
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <Table className="data-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Warehouse Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence initial={false}>
                    {filtered.map((w) => (
                      <motion.tr
                        key={w.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-2 font-medium text-gray-900">
                            <Factory className="w-4 h-4 text-gray-400 shrink-0" />
                            {w.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          {w.address ? (
                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              {w.address}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {new Date(w.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(w)}>
                              <Pencil className="w-3.5 h-3.5" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => setDeleteTarget(w)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
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
        </div>
      </div>

      {/* Create/Edit Drawer */}
      <Drawer open={drawerOpen} onOpenChange={(open) => { if (!submitting) setDrawerOpen(open); }}>
        <DrawerContent
          title={editingWarehouse ? "Edit Warehouse" : "Add New Warehouse"}
          description={
            editingWarehouse
              ? "Update this warehouse's details."
              : "Create a new physical location to store your inventory."
          }
        >
          <form onSubmit={handleSubmit} className="space-y-5 pt-4" noValidate>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Warehouse Name <span className="text-red-500">*</span>
              </label>
              <Input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Main Distribution Center"
                className={formErrors.name ? "border-red-400" : ""}
              />
              {formErrors.name && <p className="text-xs text-red-600">{formErrors.name}</p>}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <Input
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                placeholder="Full street address (optional)"
              />
              <p className="text-xs text-gray-400">Optional. Used for display and shipping purposes.</p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <DrawerClose asChild>
                <Button variant="secondary" type="button" disabled={submitting}>Cancel</Button>
              </DrawerClose>
              <Button variant="primary" type="submit" isLoading={submitting}>
                {editingWarehouse ? "Save Changes" : "Create Warehouse"}
              </Button>
            </div>
          </form>
        </DrawerContent>
      </Drawer>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Warehouse"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        isDestructive
        onConfirm={handleDelete}
        isLoading={deleting}
      />
    </div>
  );
}
