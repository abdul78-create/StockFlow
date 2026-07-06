import * as React from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';

interface Quotation {
  id: string;
  quoteNumber: string;
  customer: {
    name: string;
  };
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  totalAmount: number;
  validUntil?: string;
  createdAt: string;
}

export function QuotationList() {
  const [quotes, setQuotes] = React.useState<Quotation[]>([]);
  const [loading, setLoading] = React.useState(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const { data } = await api.get('/quotations');
        setQuotes(data.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuotes();
  }, []);

  const getStatusBadge = (status: Quotation['status']) => {
    switch (status) {
      case 'ACCEPTED': return <Badge className="bg-green-500 hover:bg-green-600 text-white">Accepted</Badge>;
      case 'SENT': return <Badge className="bg-blue-500 hover:bg-blue-600 text-white">Sent</Badge>;
      case 'REJECTED': return <Badge variant="destructive">Rejected</Badge>;
      case 'EXPIRED': return <Badge variant="secondary">Expired</Badge>;
      default: return <Badge variant="outline">Draft</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quotations</h2>
          <p className="text-muted-foreground">Manage and track customer price quotations.</p>
        </div>
        <Button onClick={() => navigate('/quotations/new')}>New Quotation</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Quotations</CardTitle>
          <CardDescription>A list of price quotes provided to clients.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-sm text-muted-foreground">Loading quotations...</div>
          ) : quotes.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">No quotations found. Click &quot;New Quotation&quot; to create one.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quote Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.map(quote => (
                  <TableRow key={quote.id}>
                    <TableCell className="font-semibold">
                      <Link to={`/quotations/${quote.id}`} className="hover:underline text-primary">
                        {quote.quoteNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{quote.customer.name}</TableCell>
                    <TableCell>{getStatusBadge(quote.status)}</TableCell>
                    <TableCell>${Number(quote.totalAmount).toFixed(2)}</TableCell>
                    <TableCell>
                      {quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>{new Date(quote.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/quotations/${quote.id}`)}>
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
export default QuotationList;
