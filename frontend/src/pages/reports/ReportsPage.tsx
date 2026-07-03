import * as React from 'react';
import { useInventoryValuation, useLowStockReport, useSalesSummary, usePurchaseSummary } from '@/lib/hooks/useReports';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { QueryStateWrapper } from '@/components/ui/query-state-wrapper';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

export function ReportsPage() {
  const valuationQuery = useInventoryValuation();
  const lowStockQuery = useLowStockReport();
  const salesQuery = useSalesSummary();
  const purchaseQuery = usePurchaseSummary();

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
      </Tabs>
    </PageTemplate>
  );
}
