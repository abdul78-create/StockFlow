import * as React from 'react';
import { api } from '../../lib/api';
import { ServerCrash } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HealthCheckWrapperProps {
  children: React.ReactNode;
}

export function HealthCheckWrapper({ children }: HealthCheckWrapperProps) {
  const [isHealthy, setIsHealthy] = React.useState<boolean | null>(null);
  const [isRetrying, setIsRetrying] = React.useState(false);

  const checkHealth = async () => {
    setIsRetrying(true);
    try {
      const response = await api.get('/health');
      if (response.status === 200) {
        setIsHealthy(true);
      } else {
        setIsHealthy(false);
      }
    } catch (error) {
      setIsHealthy(false);
    } finally {
      setIsRetrying(false);
    }
  };

  React.useEffect(() => {
    // checkHealth();
    setIsHealthy(true); // Bypass for UI preview
  }, []);

  if (isHealthy === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-sm text-gray-500">Checking system health...</p>
        </div>
      </div>
    );
  }

  if (isHealthy === false) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-max text-center">
          <div className="flex justify-center mb-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-100">
              <ServerCrash className="h-12 w-12 text-red-600" />
            </div>
          </div>
          <main className="sm:flex sm:flex-col sm:items-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Service Unavailable</h1>
            <p className="mt-4 text-base text-gray-500">
              The backend service is currently unavailable. Please check the server status.
            </p>
            <div className="mt-8 flex justify-center">
              <Button onClick={checkHealth} loading={isRetrying} size="lg">
                Retry Connection
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
