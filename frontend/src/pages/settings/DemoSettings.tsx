import * as React from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';
import { Loader2 } from 'lucide-react';

interface SeedResult {
  message: string;
  counts: Record<string, number>;
}

export function DemoSettings() {
  const [isSeeding, setIsSeeding] = React.useState(false);
  const [lastResult, setLastResult] = React.useState<SeedResult | null>(null);

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const response = await api.post('/demo/seed');
      const result = response.data.data as SeedResult;
      setLastResult(result);
      toast.success(result.message);
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? 'Failed to seed demo data.';
      toast.error(msg);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium flex items-center gap-2">
          Demo Mode
          <Badge variant="secondary" className="text-xs">Owner Only</Badge>
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Populate your workspace with realistic sample data for demos and testing.
          This is safe to run multiple times — existing demo data will not be duplicated.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.inventory className="h-5 w-5 text-muted-foreground" />
            Seed Demo Data
          </CardTitle>
          <CardDescription>
            Creates 10 products, 3 customers, 3 suppliers, 2 warehouses, 3 purchase orders,
            and 3 sales orders — all with realistic values. All demo entities are prefixed
            with <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">DEMO_</code> for
            easy identification.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {lastResult && (
            <div className="rounded-md border bg-muted/40 p-4 space-y-2">
              <p className="text-sm font-medium text-foreground">✓ {lastResult.message}</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(lastResult.counts).map(([key, count]) => (
                  <Badge key={key} variant="outline" className="text-xs">
                    {count} {key}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <p className="font-medium text-sm">Populate workspace with demo data</p>
              <p className="text-xs text-muted-foreground">
                Safe to run multiple times. Won't overwrite manually created data.
              </p>
            </div>
            <Button
              onClick={handleSeed}
              disabled={isSeeding}
              className="shrink-0"
            >
              {isSeeding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Seeding...
                </>
              ) : (
                <>
                  <Icons.add className="mr-2 h-4 w-4" />
                  Seed Demo Data
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50/30 dark:bg-amber-950/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-400">
            ℹ️  About Demo Mode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-xs text-amber-700 dark:text-amber-400 space-y-1 list-disc list-inside">
            <li>This button is only visible to organization Owners</li>
            <li>Demo data is prefixed with <code className="font-mono">DEMO_</code> so you can identify it</li>
            <li>You can safely delete demo data at any time</li>
            <li>This feature requires <code className="font-mono">DEMO_MODE=true</code> in the server environment</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
