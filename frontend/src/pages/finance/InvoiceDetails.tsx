import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInvoice, useRecordPaymentReceived } from '@/lib/hooks/useFinance';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { QueryStateWrapper } from '@/components/ui/query-state-wrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
          <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Invoice Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {validInvoice.items.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            {item.product?.name}
                            <div className="text-xs text-muted-foreground">{item.product?.sku}</div>
                          </TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">${Number(item.unitPrice).toFixed(2)}</TableCell>
                          <TableCell className="text-right">${Number(item.totalAmount).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} className="text-right font-bold">Total Amount</TableCell>
                        <TableCell className="text-right font-bold">${Number(validInvoice.totalAmount).toFixed(2)}</TableCell>
                      </TableRow>

                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {validInvoice.payments?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Payment History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Reference</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {validInvoice.payments.map((payment: any) => (
                          <TableRow key={payment.id}>
                            <TableCell>{payment.paymentDate ? format(new Date(payment.paymentDate), 'MMM d, yyyy p') : '—'}</TableCell>
                            <TableCell>{payment.paymentMethod}</TableCell>
                            <TableCell>{payment.referenceNumber || '-'}</TableCell>
                            <TableCell className="text-right text-emerald-600 font-medium">
                              ${Number(payment.amount).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card>
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
