import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Icons } from '@/lib/icons';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { INTEGRATION_STATUS } from '@/lib/enums';


interface Integration {
  id: string;
  provider: string;
  category: string;
  status: string;
  isConfigured: boolean;
}

export function IntegrationsSettings() {
  const [integrations, setIntegrations] = React.useState<Integration[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Setup form state
  const [provider, setProvider] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [configStr, setConfigStr] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const fetchIntegrations = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/integrations');
      setIntegrations(data.data);
    } catch (error: any) {
      toast.error('Failed to load integrations');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleSetup = async () => {
    if (!provider || !category || !configStr) {
      toast.error('Please fill all fields');
      return;
    }
    
    // Check if JSON is valid (if it is supposed to be JSON)
    try {
      JSON.parse(configStr);
    } catch (e) {
      toast.error('Configuration must be a valid JSON string');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/integrations', {
        provider,
        category,
        config: configStr
      });
      toast.success('Integration setup successfully');
      setIsDialogOpen(false);
      setProvider('');
      setCategory('');
      setConfigStr('');
      fetchIntegrations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to setup integration');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (providerName: string) => {
    try {
      await api.delete(`/integrations/${providerName}`);
      toast.success('Integration removed');
      fetchIntegrations();
    } catch (error: any) {
      toast.error('Failed to remove integration');
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading integrations...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Integrations</h3>
          <p className="text-sm text-muted-foreground">
            Connect StockFlow with your favorite tools.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Icons.add className="mr-2 h-4 w-4" /> Add Integration
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Setup Integration</DialogTitle>
              <DialogDescription>
                Configure a new third-party integration by providing its API credentials.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Provider</label>
                <Select value={provider} onValueChange={setProvider}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STRIPE">Stripe (Payment)</SelectItem>
                    <SelectItem value="SENDGRID">SendGrid (Email)</SelectItem>
                    <SelectItem value="QUICKBOOKS">QuickBooks (Accounting)</SelectItem>
                    <SelectItem value="SHOPIFY">Shopify (E-Commerce)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PAYMENT">Payment</SelectItem>
                    <SelectItem value="EMAIL">Email</SelectItem>
                    <SelectItem value="ACCOUNTING">Accounting</SelectItem>
                    <SelectItem value="E_COMMERCE">E-Commerce</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Configuration (JSON)</label>
                <Input 
                  placeholder='{"apiKey": "sk_..."}'
                  value={configStr}
                  onChange={(e) => setConfigStr(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSetup} disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Configuration'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {integrations.length === 0 ? (
          <div className="col-span-full p-8 text-center border border-dashed rounded-lg">
            <p className="text-muted-foreground">No integrations configured yet.</p>
          </div>
        ) : (
          integrations.map((int) => (
            <Card key={int.id}>
              <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-base font-semibold">{int.provider}</CardTitle>
                  <CardDescription>{int.category}</CardDescription>
                </div>
                <Badge variant={INTEGRATION_STATUS[int.status]?.variant ?? 'outline'}>
                  {INTEGRATION_STATUS[int.status]?.label ?? int.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <span className="text-muted-foreground mr-2">Configured:</span>
                  <span className={int.isConfigured ? "text-green-600" : "text-yellow-600"}>
                    {int.isConfigured ? "Yes" : "No"}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="pt-3">
                <Button variant="destructive" size="sm" onClick={() => handleRemove(int.provider)}>
                  Disconnect
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
