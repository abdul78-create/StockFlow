import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export function AutomationSettings() {
  const [isTriggeringOverdue, setIsTriggeringOverdue] = React.useState(false);
  const [isTriggeringSubs, setIsTriggeringSubs] = React.useState(false);

  const handleTriggerOverdue = async () => {
    setIsTriggeringOverdue(true);
    try {
      await api.post('/automation/trigger/overdue-invoices');
      toast.success('Overdue invoices check triggered successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to trigger overdue check');
    } finally {
      setIsTriggeringOverdue(false);
    }
  };

  const handleTriggerSubscriptions = async () => {
    setIsTriggeringSubs(true);
    try {
      await api.post('/automation/trigger/subscriptions');
      toast.success('Subscriptions check triggered successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to trigger subscriptions check');
    } finally {
      setIsTriggeringSubs(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Automation Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage system automation tasks and background jobs.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manual Triggers</CardTitle>
          <CardDescription>
            Background jobs usually run automatically on schedule. You can manually trigger them here for testing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <p className="font-medium">Check Overdue Invoices</p>
              <p className="text-sm text-muted-foreground">Runs daily to mark overdue invoices and generate alerts.</p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleTriggerOverdue} 
              disabled={isTriggeringOverdue}
            >
              {isTriggeringOverdue ? 'Running...' : 'Trigger Now'}
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <p className="font-medium">Check Expired Subscriptions</p>
              <p className="text-sm text-muted-foreground">Runs daily to check for subscriptions past their end date.</p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleTriggerSubscriptions} 
              disabled={isTriggeringSubs}
            >
              {isTriggeringSubs ? 'Running...' : 'Trigger Now'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
