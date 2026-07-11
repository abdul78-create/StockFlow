import React from "react";
import { motion } from "framer-motion";
import { BarChart, TrendingUp, DollarSign, Download, Calendar } from "lucide-react";
import { Button } from "../components/ui/Button";

export function Reports() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Analytics and reporting insights</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Calendar className="w-4 h-4" />
            Last 30 Days
          </Button>
          <Button className="gap-2">
            <Download className="w-4 h-4" />
            Export Data
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl border border-gray-200/60 shadow-sm"
        >
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-gray-500">Total Sales</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">₹ 24,50,000</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-xl border border-gray-200/60 shadow-sm"
        >
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mb-4">
            <BarChart className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">1,240</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-xl border border-gray-200/60 shadow-sm"
        >
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-4">
            <DollarSign className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-gray-500">Average Order Value</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">₹ 1,975</p>
        </motion.div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-hidden h-96 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <BarChart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Detailed charts will appear here</p>
        </div>
      </div>
    </div>
  );
}
