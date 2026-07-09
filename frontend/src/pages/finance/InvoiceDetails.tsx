import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInvoice, useRecordPaymentReceived } from '@/lib/hooks/useFinance';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { QueryStateWrapper } from '@/components/ui/query-state-wrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { InvoicePDFButton } from '@/components/InvoicePDFButton';

import { INVOICE_STATUS } from '@/lib/enums';


export function InvoiceDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: invoice, isLoading, error } = useInvoice(id!);
  const recordPayment = useRecordPaymentReceived();
  
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');
  const [reference, setReference] = useState('');

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;
    
    recordPayment.mutate(
      {
        invoiceId: invoice.id,
        amount: Number(paymentAmount),
        paymentMethod,
        referenceNumber: reference,
      },
      {
        onSuccess: () => {
          setIsPaymentOpen(false);
          setPaymentAmount('');
          setReference('');
        }
      }
    );
  };

  const itemColumns: ColumnDef<any>[] = [
    {
      id: 'product',
      accessorFn: (row) => row.product?.name,
      header: 'Product',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.product?.name}</div>
          <div className="text-xs text-muted-foreground">{row.original.product?.sku}</div>
        </div>
      ),
    },
    {
      accessorKey: 'quantity',
      header: 'Qty',
      cell: ({ row }) => <span className="text-right block">{row.original.quantity}</span>,
    },
    {
      accessorKey: 'unitPrice',
      header: 'Unit Price',
      cell: ({ row }) => <span className="text-right block">${Number(row.original.unitPrice).toFixed(2)}</span>,
    },
    {
      accessorKey: 'totalAmount',
      header: 'Total',
      cell: ({ row }) => <span className="text-right block font-medium">${Number(row.original.totalAmount).toFixed(2)}</span>,
    }
  ];

  const paymentColumns: ColumnDef<any>[] = [
    {
      accessorKey: 'paymentDate',
      header: 'Date',
      cell: ({ row }) => <span>{row.original.paymentDate ? format(new Date(row.original.paymentDate), 'MMM d, yyyy p') : '—'}</span>,
    },
    {
      accessorKey: 'paymentMethod',
      header: 'Method',
    },
    {
      accessorKey: 'referenceNumber',
      header: 'Reference',
      cell: ({ row }) => <span>{row.original.referenceNumber || '-'}</span>,
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => <span className="text-right block text-emerald-600 font-medium">${Number(row.original.amount).toFixed(2)}</span>,
    }
  ];

  return (
    <QueryStateWrapper
      isLoading={isLoading}
      error={error}
      data={invoice}
      isEmpty={(i) => !i}
      emptyProps={{
        title: "Invoice Not Found",
        description: "The invoice you're looking for doesn't exist.",
      }}
    >
      {(validInvoice) => (
        <PageTemplate
          title={`Invoice ${validInvoice.invoiceNumber}`}
          subtitle={`Manage invoice for ${validInvoice.customer?.name}`}
          breadcrumbs={[
            { label: 'Invoices', href: '/finance/invoices' },
            { label: validInvoice.invoiceNumber, href: `/finance/invoices/${validInvoice.id}` },
          ]}
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate('/finance/invoices')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              <InvoicePDFButton invoice={validInvoice} />

              {Number(validInvoice.balanceDue) > 0 && validInvoice.status !== 'CANCELLED' && (
                <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Record Payment
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Record Payment for {validInvoice.invoiceNumber}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleRecordPayment} className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Amount</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          max={Number(validInvoice.balanceDue)}
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          Max allowable: ${Number(validInvoice.balanceDue).toFixed(2)}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Payment Method</Label>
                        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                            <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                            <SelectItem value="CASH">Cash</SelectItem>
                            <SelectItem value="CHECK">Check</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Reference Number (Optional)</Label>
                        <Input
                          value={reference}
                          onChange={(e) => setReference(e.target.value)}
                          placeholder="e.g. Transaction ID"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsPaymentOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={recordPayment.isPending}>
                          {recordPayment.isPending ? 'Recording...' : 'Record Payment'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          }
        >
          <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
            <div className="space-y-6">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Invoice Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={itemColumns}
                    data={validInvoice.items || []}
                    searchKey="product"
                    searchPlaceholder="Search items..."
                    emptyTitle="No items"
                    emptyDescription="This invoice has no items."
                  />
                  <div className="mt-4 pt-4 border-t flex justify-end">
                    <div className="flex justify-between items-center w-64 font-bold">
                      <span>Total Amount:</span>
                      <span>${Number(validInvoice.totalAmount).toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {validInvoice.payments?.length > 0 && (
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle>Payment History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DataTable
                      columns={paymentColumns}
                      data={validInvoice.payments}
                      searchKey="referenceNumber"
                      searchPlaceholder="Search reference..."
                      emptyTitle="No payments"
                      emptyDescription="No payments have been recorded."
                    />
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Status</div>
                    <Badge variant={INVOICE_STATUS[validInvoice.status]?.variant ?? 'outline'} className="mt-1">
                      {INVOICE_STATUS[validInvoice.status]?.label ?? validInvoice.status}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Customer</div>
                    <div className="font-medium mt-1">{validInvoice.customer?.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Issued Date</div>
                    <div className="font-medium mt-1">{validInvoice.issuedDate ? format(new Date(validInvoice.issuedDate), 'MMM d, yyyy') : '—'}</div>
                  </div>
                  {validInvoice.salesOrder && (
                    <div>
                      <div className="text-sm text-muted-foreground">Sales Order</div>
                      <div className="font-medium mt-1">{validInvoice.salesOrder.soNumber}</div>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t border-border mt-4">
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-muted-foreground">Total Amount</span>
                      <span className="font-medium">${Number(validInvoice.totalAmount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-muted-foreground">Paid Amount</span>
                      <span className="font-medium text-emerald-600">
                        ${(Number(validInvoice.totalAmount) - Number(validInvoice.balanceDue)).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold mt-4 pt-4 border-t border-border">
                      <span>Balance Due</span>
                      <span className="text-destructive">${Number(validInvoice.balanceDue).toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </PageTemplate>
      )}
    </QueryStateWrapper>
  );
}
