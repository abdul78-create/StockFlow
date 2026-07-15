import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, DollarSign, Activity, FileText, ShoppingCart, Truck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { ErrorState } from "../components/ui/ErrorState";
import api from "../lib/api";

interface FinancialSummary {
  totalAccountsReceivable: number;
  totalAccountsPayable: number;
  totalCashReceived: number;
  totalCashPaid: number;
  netCashFlow: number;
}

export function Reports() {
  const [finSummary, setFinSummary] = useState<FinancialSummary | null>(null);
  const [salesSummary, setSalesSummary] = useState<any[]>([]);
  const [purchaseSummary, setPurchaseSummary] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");
      const [finRes, salesRes, purchRes] = await Promise.all([
        api.get("/reports/financial-summary"),
        api.get("/reports/sales-summary"),
        api.get("/reports/purchases"),
      ]);
      setFinSummary(finRes.data.data);
      setSalesSummary(salesRes.data.data);
      setPurchaseSummary(purchRes.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="p-6 md:p-10 max-w-[1400px] mx-auto space-y-8 animate-pulse">
        <div className="h-8 bg-gray-100 rounded w-48 mb-2" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-50 rounded-xl border border-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <ErrorState message={error} onRetry={fetchReports} />
      </div>
    );
  }

  const formatCurr = (val: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);
  
  const totalSalesRevenue = salesSummary.reduce((acc, curr) => acc + Number(curr.totalRevenue || 0), 0);
  const totalSalesCount = salesSummary.reduce((acc, curr) => acc + Number(curr.count || 0), 0);
  
  const totalPurchaseExpense = purchaseSummary.reduce((acc, curr) => acc + Number(curr.totalExpense || 0), 0);
  const totalPurchaseCount = purchaseSummary.reduce((acc, curr) => acc + Number(curr.count || 0), 0);

  return (
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto space-y-8 font-sans selection:bg-gray-900 selection:text-white">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Reports</h1>
        <p className="text-sm text-gray-500 mt-1.5 font-medium">Analytics and reporting insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-xl border border-gray-200/60 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-gray-100 text-gray-900 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Net Cash Flow</p>
          </div>
          <p className={`text-3xl font-bold mt-2 ${finSummary && finSummary.netCashFlow >= 0 ? "text-green-700" : "text-red-700"}`}>
            {formatCurr(finSummary?.netCashFlow || 0)}
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-xl border border-gray-200/60 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-gray-100 text-gray-900 rounded-lg flex items-center justify-center mb-4">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Sales Revenue</p>
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurr(totalSalesRevenue)}</p>
          <p className="text-xs text-gray-500 font-medium mt-1">{totalSalesCount} total sales orders</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-xl border border-gray-200/60 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-gray-100 text-gray-900 rounded-lg flex items-center justify-center mb-4">
              <Truck className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Purchases Expense</p>
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurr(totalPurchaseExpense)}</p>
          <p className="text-xs text-gray-500 font-medium mt-1">{totalPurchaseCount} total purchase orders</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-gray-200/60 shadow-sm rounded-xl">
          <CardHeader className="p-6 pb-4">
            <CardTitle className="text-base font-semibold">Financial Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              <div className="flex items-center justify-between p-6 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">Accounts Receivable (Invoices)</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{formatCurr(finSummary?.totalAccountsReceivable || 0)}</span>
              </div>
              <div className="flex items-center justify-between p-6 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">Accounts Payable (Bills)</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{formatCurr(finSummary?.totalAccountsPayable || 0)}</span>
              </div>
              <div className="flex items-center justify-between p-6 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Activity className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">Total Cash Received</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{formatCurr(finSummary?.totalCashReceived || 0)}</span>
              </div>
              <div className="flex items-center justify-between p-6 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Activity className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">Total Cash Paid</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{formatCurr(finSummary?.totalCashPaid || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200/60 shadow-sm rounded-xl">
          <CardHeader className="p-6 pb-4">
            <CardTitle className="text-base font-semibold">Sales by Status</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {salesSummary.length === 0 ? (
              <div className="p-12 text-center text-sm text-gray-500 font-medium">No sales data available.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {salesSummary.map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-6 hover:bg-gray-50/50 transition-colors">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">{s.status}</span>
                      <span className="text-xs text-gray-500 font-medium mt-0.5">{s.count} orders</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{formatCurr(Number(s.totalRevenue || 0))}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
