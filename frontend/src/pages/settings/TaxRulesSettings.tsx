import * as React from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface TaxRule {
  id: string;
  name: string;
  taxType: string;
  rate: number;
  isDefault: boolean;
}

export function TaxRulesSettings() {
  const [rules, setRules] = React.useState<TaxRule[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [name, setName] = React.useState('');
  const [taxType, setTaxType] = React.useState('GST');
  const [rate, setRate] = React.useState('');
  const [isDefault, setIsDefault] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const fetchRules = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/tax-rules');
      setRules(data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load tax rules');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !rate) {
      toast.error('Please enter name and rate');
      return;
    }
    setSaving(true);
    try {
      await api.post('/tax-rules', {
        name,
        taxType,
        rate: Number(rate),
        isDefault,
      });
      toast.success('Tax rule created successfully');
      setName('');
      setRate('');
      setIsDefault(false);
      fetchRules();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create tax rule');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tax rule?')) return;
    try {
      await api.delete(`/tax-rules/${id}`);
      toast.success('Tax rule deleted');
      fetchRules();
    } catch {
      toast.error('Failed to delete tax rule');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Tax Rules</h2>
        <p className="text-muted-foreground">Configure GST, VAT, and Sales Tax values for invoicing and orders.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Form */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Create Tax Rule</CardTitle>
            <CardDescription>Define a new rate schema.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tax-name">Rule Name</Label>
                <Input
                  id="tax-name"
                  placeholder="e.g. GST 18%, VAT 20%"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax-type">Tax Type</Label>
                <Select value={taxType} onValueChange={setTaxType}>
                  <SelectTrigger id="tax-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GST">GST</SelectItem>
                    <SelectItem value="VAT">VAT</SelectItem>
                    <SelectItem value="SALES_TAX">Sales Tax</SelectItem>
                    <SelectItem value="CUSTOM">Custom Tax</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax-rate">Rate (%)</Label>
                <Input
                  id="tax-rate"
                  type="number"
                  placeholder="e.g. 18.0"
                  step="0.01"
                  value={rate}
                  onChange={e => setRate(e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="tax-default"
                  checked={isDefault}
                  onCheckedChange={setIsDefault}
                />
                <Label htmlFor="tax-default">Set as organization default</Label>
              </div>

              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? 'Saving...' : 'Add Tax Rule'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* List */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Configured Taxes</CardTitle>
            <CardDescription>Tax rates applicable to products and orders.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-sm text-muted-foreground">Loading tax rules...</div>
            ) : rules.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">No tax rules configured.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.map(rule => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">{rule.name}</TableCell>
                      <TableCell>{rule.taxType}</TableCell>
                      <TableCell>{rule.rate}%</TableCell>
                      <TableCell>
                        {rule.isDefault ? (
                          <Badge variant="default">Default</Badge>
                        ) : (
                          <Badge variant="secondary">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(rule.id)}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          Delete
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
    </div>
  );
}
export default TaxRulesSettings;
