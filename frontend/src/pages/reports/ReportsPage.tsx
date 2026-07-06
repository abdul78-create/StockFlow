import * as React from 'react';
import { useInventoryValuation, useLowStockReport, useSalesSummary, usePurchaseSummary, useActivityLog, useFinancialSummary, ActivityLogEntry } from '@/lib/hooks/useReports';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { QueryStateWrapper } from '@/components/ui/query-state-wrapper';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDistanceToNow } from 'date-fns';

export function ReportsPage() {
  const valuationQuery = useInventoryValuation();
  const lowStockQuery = useLowStockReport();
  const salesQuery = useSalesSummary();
  const purchaseQuery = usePurchaseSummary();
  const financeQuery = useFinancialSummary();

  const [activityPage, setActivityPage] = React.useState(1);
  const [activityEntity, setActivityEntity] = React.useState<string | undefined>(undefined);
  const activityQuery = useActivityLog(activityPage, 25, activityEntity);

  const valuationColumns: ColumnDef<any>[] = [
    { accessorKey: 'categoryName', header: 'Category' },
    { accessorKey: 'productCount', header: 'Products' },
    { accessorKey: 'totalQuantity', header: 'Total Units' },
    { 
      accessorKey: 'totalValuation', 
      header: 'Valuation',
      cell: ({ row }) => `$${row.original.totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2 })}` 
    },
  ];

  const lowStockColumns: ColumnDef<any>[] = [
    { accessorKey: 'sku', header: 'SKU' },
    { accessorKey: 'name', header: 'Product Name' },
    { accessorKey: 'warehouseName', header: 'Warehouse' },
    { 
      accessorKey: 'quantity', 
      header: 'Available',
      cell: ({ row }) => (
        <span className="text-destructive font-bold">{row.original.quantity}</span>
      )
    },
    { accessorKey: 'minimumStock', header: 'Min Required' },
  ];

  const salesColumns: ColumnDef<any>[] = [
    { accessorKey: 'status', header: 'Order Status' },
    { accessorKey: 'count', header: 'Total Orders' },
    { 
      accessorKey: 'totalRevenue', 
      header: 'Revenue',
      cell: ({ row }) => `$${row.original.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}` 
    },
  ];

  const purchaseColumns: ColumnDef<any>[] = [
    { accessorKey: 'status', header: 'Order Status' },
    { accessorKey: 'count', header: 'Total Orders' },
    { 
      accessorKey: 'totalExpense', 
      header: 'Expense',
      cell: ({ row }) => `$${row.original.totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })}` 
    },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <PageTemplate
      title="Reports & Analytics"
      subtitle="Gain insights into inventory health and sales performance"
    >
      <Tabs defaultValue="valuation" className="space-y-4">
        <TabsList>
          <TabsTrigger value="valuation">Inventory Valuation</TabsTrigger>
          <TabsTrigger value="low-stock">Low Stock Alerts</TabsTrigger>
          <TabsTrigger value="sales">Sales Summary</TabsTrigger>
          <TabsTrigger value="purchases">Purchases Summary</TabsTrigger>
          <TabsTrigger value="finance">Financial Summary</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>

        <TabsContent value="valuation">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Valuation by Category</CardTitle>
              <CardDescription>Total monetary value of stock broken down by product categories.</CardDescription>
            </CardHeader>
            <CardContent>
              <QueryStateWrapper
                isLoading={valuationQuery.isLoading}
                error={valuationQuery.error}
                data={valuationQuery.data}
                isEmpty={(d) => !d || d.length === 0}
              >
                {(data) => (
                  <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data}
                            dataKey="totalValuation"
                            nameKey="categoryName"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={false}
                          >
                            {data.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(val: any) => `$${Number(val || 0).toLocaleString()}`} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div>
                      <DataTable
                        columns={valuationColumns}
                        data={data}
                        isLoading={false}
                        searchKey="categoryName"
                        searchPlaceholder="Filter categories..."
                      />
                    </div>
                  </div>
                )}
              </QueryStateWrapper>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="low-stock">
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Alerts</CardTitle>
              <CardDescription>Items that have fallen below their designated minimum stock thresholds.</CardDescription>
            </CardHeader>
            <CardContent>
              <QueryStateWrapper
                isLoading={lowStockQuery.isLoading}
                error={lowStockQuery.error}
                data={lowStockQuery.data}
                isEmpty={(d) => !d || d.length === 0}
                emptyProps={{ title: 'Stock is healthy', description: 'No items are currently below minimum stock levels.' }}
              >
                {(data) => (
                  <DataTable
                    columns={lowStockColumns}
                    data={data}
                    isLoading={false}
                    searchKey="name"
                    searchPlaceholder="Search products..."
                    enableExport={true}
                    exportFilename="low-stock-report.csv"
                  />
                )}
              </QueryStateWrapper>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Sales Performance</CardTitle>
              <CardDescription>Aggregate view of sales orders and revenue by fulfillment status.</CardDescription>
            </CardHeader>
            <CardContent>
              <QueryStateWrapper
                isLoading={salesQuery.isLoading}
                error={salesQuery.error}
                data={salesQuery.data}
                isEmpty={(d) => !d || d.length === 0}
              >
                {(data) => (
                  <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data}
                            dataKey="totalRevenue"
                            nameKey="status"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={false}
                          >
                            {data.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(val: any) => `$${Number(val || 0).toLocaleString()}`} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div>
                      <DataTable
                        columns={salesColumns}
                        data={data}
                        isLoading={false}
                        searchKey="status"
                        searchPlaceholder="Filter statuses..."
                      />
                    </div>
                  </div>
                )}
              </QueryStateWrapper>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchases">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Performance</CardTitle>
              <CardDescription>Aggregate view of purchase orders and expenses by status.</CardDescription>
            </CardHeader>
            <CardContent>
              <QueryStateWrapper
                isLoading={purchaseQuery.isLoading}
                error={purchaseQuery.error}
                data={purchaseQuery.data}
                isEmpty={(d) => !d || d.length === 0}
              >
                {(data) => (
                  <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data}
                            dataKey="totalExpense"
                            nameKey="status"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={false}
                          >
                            {data.map((_: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(val: any) => `$${Number(val || 0).toLocaleString()}`} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div>
                      <DataTable
                        columns={purchaseColumns}
                        data={data}
                        isLoading={false}
                        searchKey="status"
                        searchPlaceholder="Filter statuses..."
                      />
                    </div>
                  </div>
                )}
              </QueryStateWrapper>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="finance">
          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
              <CardDescription>Overview of cash flow, receivables, and payables.</CardDescription>
            </CardHeader>
            <CardContent>
              <QueryStateWrapper
                isLoading={financeQuery.isLoading}
                error={financeQuery.error}
                data={financeQuery.data}
                isEmpty={(d) => !d}
              >
                {(data) => (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Accounts Receivable</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">${data.totalAccountsReceivable.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Accounts Payable</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-destructive">${data.totalAccountsPayable.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Cash Received</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">${data.totalCashReceived.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Cash Paid</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">${data.totalCashPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                      </CardContent>
                    </Card>
                    <Card className="md:col-span-2 lg:col-span-4">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Net Cash Flow</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className={`text-4xl font-bold ${data.netCashFlow >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                          ${data.netCashFlow.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </QueryStateWrapper>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Activity Log</CardTitle>
                  <CardDescription>Complete audit trail of all system actions.</CardDescription>
                </div>
                <Select value={activityEntity || 'all'} onValueChange={(v) => { setActivityEntity(v === 'all' ? undefined : v); setActivityPage(1); }}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="All Entities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Entities</SelectItem>
                    <SelectItem value="Product">Product</SelectItem>
                    <SelectItem value="Inventory">Inventory</SelectItem>
                    <SelectItem value="PurchaseOrder">Purchase Orders</SelectItem>
                    <SelectItem value="SalesOrder">Sales Orders</SelectItem>
                    <SelectItem value="Customer">Customer</SelectItem>
                    <SelectItem value="Supplier">Supplier</SelectItem>
                    <SelectItem value="Warehouse">Warehouse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <QueryStateWrapper
                isLoading={activityQuery.isLoading}
                error={activityQuery.error}
                data={activityQuery.data}
                isEmpty={(d) => !d || d.logs.length === 0}
                emptyProps={{ title: 'No activity yet', description: 'System actions will appear here as they occur.' }}
              >
                {(data) => {
                  const activityColumns: ColumnDef<ActivityLogEntry>[] = [
                    {
                      accessorKey: 'createdAt',
                      header: 'Time',
                      cell: ({ row }) => (
                        <span className="text-muted-foreground text-sm">
                          {formatDistanceToNow(new Date(row.original.createdAt), { addSuffix: true })}
                        </span>
                      ),
                    },
                    {
                      accessorKey: 'action',
                      header: 'Action',
                      cell: ({ row }) => (
                        <Badge variant="outline" className="font-mono text-xs">
                          {row.original.action}
                        </Badge>
                      ),
                    },
                    { accessorKey: 'entity', header: 'Entity' },
                    {
                      accessorKey: 'entityId',
                      header: 'Entity ID',
                      cell: ({ row }) => (
                        <span className="font-mono text-xs text-muted-foreground">
                          {row.original.entityId ? row.original.entityId.slice(0, 8) + '...' : '—'}
                        </span>
                      ),
                    },
                    {
                      accessorKey: 'userId',
                      header: 'User',
                      cell: ({ row }) => (
                        <span className="text-sm">
                          {row.original.userId === 'SYSTEM' ? 'System' : row.original.userId?.slice(0, 8) + '...'}
                        </span>
                      ),
                    },
                  ];

                  return (
                    <>
                      <DataTable
                        columns={activityColumns}
                        data={data.logs}
                        isLoading={false}
                        searchKey="action"
                        searchPlaceholder="Filter actions..."
                      />
                      {data.total > 25 && (
                        <div className="flex items-center justify-between mt-4">
                          <p className="text-sm text-muted-foreground">
                            Page {activityPage} of {Math.ceil(data.total / 25)}
                          </p>
                          <div className="flex gap-2">
                            <button
                              className="px-3 py-1 rounded border text-sm disabled:opacity-50"
                              disabled={activityPage <= 1}
                              onClick={() => setActivityPage((p) => p - 1)}
                            >
                              Previous
                            </button>
                            <button
                              className="px-3 py-1 rounded border text-sm disabled:opacity-50"
                              disabled={activityPage >= Math.ceil(data.total / 25)}
                              onClick={() => setActivityPage((p) => p + 1)}
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  );
                }}
              </QueryStateWrapper>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageTemplate>
  );
}
