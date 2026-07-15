import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Search,
  X,
  RefreshCw,
  FileText,
  CreditCard,
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

interface FinanceItem {
  id: string;
  number: string;
  status: 'DRAFT' | 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  totalAmount: number;
  paidAmount: number;
  entityName: string; // Customer name or Supplier companyName
  createdAt: string;
}

const STATUS_COLORS = {
  DRAFT: "bg-gray-100 text-gray-700 border-gray-200",
  UNPAID: "bg-yellow-50 text-yellow-700 border-yellow-200",
  PARTIAL: "bg-blue-50 text-blue-700 border-blue-200",
  PAID: "bg-green-50 text-green-700 border-green-200",
  OVERDUE: "bg-red-50 text-red-700 border-red-200",
  CANCELLED: "bg-gray-100 text-gray-500 border-gray-200",
};

export function Finance() {
  const [activeTab, setActiveTab] = useState<'INVOICES' | 'BILLS'>('INVOICES');
  
  const [data, setData] = useState<FinanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FinanceItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Payment Form
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [referenceNumber, setReferenceNumber] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const endpoint = activeTab === 'INVOICES' ? '/finance/invoices' : '/finance/bills';
      const res = await api.get(endpoint);
      
      const rawData = res.data.data || [];
      const formatted = rawData.map((d: any) => ({
        id: d.id,
        number: d.invoiceNumber || d.billNumber,
        status: d.status,
        totalAmount: d.totalAmount,
        paidAmount: d.paidAmount || 0,
        entityName: d.customer?.name || d.supplier?.companyName || 'Unknown',
        createdAt: d.createdAt
      }));
      
      setData(formatted);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load financial records");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openPayment = (item: FinanceItem) => {
    setSelectedItem(item);
    setAmount(item.totalAmount - item.paidAmount);
    setPaymentMethod("Bank Transfer");
    setReferenceNumber("");
    setPaymentDrawerOpen(true);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || amount <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }
    
    try {
      setSubmitting(true);
      const endpoint = activeTab === 'INVOICES' ? '/finance/invoices/payments' : '/finance/bills/payments';
      const payload = activeTab === 'INVOICES' 
        ? { invoiceId: selectedItem.id, amount, paymentMethod, referenceNumber }
        : { billId: selectedItem.id, amount, paymentMethod, referenceNumber };
        
      await api.post(endpoint, payload);
      toast.success("Payment recorded successfully");
      setPaymentDrawerOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to record payment");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = data.filter((d) =>
    d.number?.toLowerCase().includes(search.toLowerCase()) ||
    d.entityName?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex flex-col h-full font-sans selection:bg-gray-900 selection:text-white">
      <div className="px-6 md:px-10 pt-8 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Finance</h1>
          <p className="text-sm text-gray-500 mt-1.5 font-medium">Manage accounts receivable and payable.</p>
        </div>
      </div>

      <div className="flex-1 px-6 md:px-10 pb-10 overflow-hidden flex flex-col">
        {/* Tabs */}
        <div className="flex items-center gap-6 mb-6 border-b border-gray-200">
          <button 
            onClick={() => { setActiveTab('INVOICES'); setCurrentPage(1); }}
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'INVOICES' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Invoices (AR)
          </button>
          <button 
            onClick={() => { setActiveTab('BILLS'); setCurrentPage(1); }}
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'BILLS' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Bills (AP)
          </button>
        </div>

        <div className="bg-white border border-gray-200/60 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-gray-100 bg-gray-50/30">
            <div className="w-full max-w-md relative">
              <Input
                placeholder="Search by number or name…"
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
                {loading ? "" : `${filtered.length} records`}
              </span>
              <button onClick={fetchData} className="text-gray-400 hover:text-gray-600 transition-colors p-1" title="Refresh">
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
              <div className="p-12"><ErrorState message={error} onRetry={fetchData} /></div>
            ) : filtered.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <EmptyState
                  icon={<FileText className="w-6 h-6 text-gray-400" />}
                  title={search ? "No records match your search" : `No ${activeTab.toLowerCase()} found`}
                  description={search ? "Try adjusting your search terms." : `Create sales/purchase orders to generate ${activeTab.toLowerCase()}.`}
                />
              </div>
            ) : (
              <Table className="data-table">
                <TableHeader className="bg-gray-50/50 sticky top-0 z-10 backdrop-blur-sm">
                  <TableRow className="border-b border-gray-100">
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Record Details</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Entity</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence initial={false}>
                    {paginated.map((item) => {
                      const balance = item.totalAmount - item.paidAmount;
                      return (
                        <motion.tr
                          key={item.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group"
                        >
                          <TableCell className="pl-6">
                            <div className="font-semibold text-gray-900">{item.number}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{new Date(item.createdAt).toLocaleDateString()}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-gray-700">{item.entityName}</div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="font-bold text-gray-900">₹{Number(item.totalAmount).toFixed(2)}</div>
                            <div className="text-xs text-gray-500 font-medium mt-0.5">Balance: ₹{Number(balance).toFixed(2)}</div>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${STATUS_COLORS[item.status]}`}>
                              {item.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {(item.status === 'UNPAID' || item.status === 'PARTIAL' || item.status === 'OVERDUE') && (
                                <Button variant="primary" size="sm" onClick={() => openPayment(item)} className="h-8 text-xs">
                                  <CreditCard className="w-3.5 h-3.5 mr-1" /> Record Payment
                                </Button>
                              )}
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
            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50/50">
              <div className="hidden sm:block text-sm text-gray-500">
                Showing <span className="font-medium text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-gray-900">{Math.min(currentPage * itemsPerPage, filtered.length)}</span> of <span className="font-medium text-gray-900">{filtered.length}</span> records
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

      {/* RECORD PAYMENT DRAWER */}
      <Drawer open={paymentDrawerOpen} onOpenChange={(open) => !submitting && setPaymentDrawerOpen(open)}>
        <DrawerContent title="Record Payment" description={`Register a payment for ${selectedItem?.number}`}>
          <form onSubmit={handlePaymentSubmit} className="space-y-6 pt-6">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-900">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                <Input 
                  required 
                  type="number" 
                  min="0.01" 
                  step="0.01" 
                  max={selectedItem ? (selectedItem.totalAmount - selectedItem.paidAmount) : undefined}
                  value={amount === 0 ? "" : amount} 
                  onChange={e => setAmount(Number(e.target.value))}
                  className="pl-7"
                />
              </div>
              <p className="text-xs text-gray-500">Balance remaining: ₹{selectedItem ? (selectedItem.totalAmount - selectedItem.paidAmount).toFixed(2) : '0.00'}</p>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-900">Payment Method</label>
              <select 
                value={paymentMethod} 
                onChange={e => setPaymentMethod(e.target.value)}
                className="w-full h-10 px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-900">Reference Number</label>
              <Input value={referenceNumber} onChange={e => setReferenceNumber(e.target.value)} placeholder="Txn ID, Cheque No." />
            </div>

            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
              <DrawerClose asChild><Button variant="ghost" type="button" disabled={submitting}>Cancel</Button></DrawerClose>
              <Button variant="primary" type="submit" isLoading={submitting}>Confirm Payment</Button>
            </div>
          </form>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
