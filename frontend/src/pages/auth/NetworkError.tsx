import * as React from 'react';
import { Icons } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { pageTransition } from '@/lib/motion';

export function NetworkError() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4"
    >
      <div className="rounded-full bg-destructive/10 p-6 mb-6 text-destructive">
        <Icons.error className="h-12 w-12" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight mb-2">Service Unavailable</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        We cannot connect to the server right now. This is likely a temporary network issue or the server is undergoing maintenance.
      </p>
      <Button size="lg" onClick={handleRetry}>
        <Icons.refresh className="mr-2 h-4 w-4" />
        Retry Connection
      </Button>
    </motion.div>
  );
}
