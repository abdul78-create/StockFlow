import * as React from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';

interface PurchaseReturn {
  id: string;
  returnNumber: string;
  supplier: {
    companyName: string;
  };
  status: 'DRAFT' | 'APPROVED' | 'COMPLETED' | 'CANCELLED';
  totalAmount: number;
  reason?: string;
  createdAt: string;
}

export function PurchaseReturnList() {
  const [returns, setReturns] = React.useState<PurchaseReturn[]>([]);
  const [loading, setLoading] = React.useState(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchReturns = async () => {
      try {
        const { data } = await api.get('/purchase-returns');
        setReturns(data.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReturns();
  }, []);

  const getStatusBadge = (status: PurchaseReturn['status']) => {
    switch (status) {
      case 'APPROVED': return <Badge className="bg-blue-500 hover:bg-blue-600 text-white">Approved</Badge>;
      case 'COMPLETED': return <Badge className="bg-green-500 hover:bg-green-600 text-white">Completed</Badge>;
      case 'CANCELLED': return <Badge variant="destructive">Cancelled</Badge>;
      default: return <Badge variant="outline">Draft</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Purchase Returns</h2>
          <p className="text-muted-foreground">Manage and track product returns sent back to suppliers.</p>
        </div>
        <Button onClick={() => navigate('/purchase-returns/new')}>New Return</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Purchase Returns</CardTitle>
          <CardDescription>A list of returned purchases and reversal documents.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-sm text-muted-foreground">Loading purchase returns...</div>
          ) : returns.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">No purchase returns found. Click &quot;New Return&quot; to create one.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Return Number</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {returns.map(ret => (
                  <TableRow key={ret.id}>
                    <TableCell className="font-semibold">
                      <Link to={`/purchase-returns/${ret.id}`} className="hover:underline text-primary">
                        {ret.returnNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{ret.supplier.companyName}</TableCell>
                    <TableCell>{getStatusBadge(ret.status)}</TableCell>
                    <TableCell>${Number(ret.totalAmount).toFixed(2)}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{ret.reason || 'N/A'}</TableCell>
                    <TableCell>{new Date(ret.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/purchase-returns/${ret.id}`)}>
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
export default PurchaseReturnList;
