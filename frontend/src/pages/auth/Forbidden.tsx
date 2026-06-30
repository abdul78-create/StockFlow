import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { pageTransition } from '@/lib/motion';

export function Forbidden() {
  const navigate = useNavigate();

  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4"
    >
      <div className="rounded-full bg-destructive/10 p-6 mb-6 text-destructive">
        <Icons.warning className="h-12 w-12" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight mb-2">Access Denied</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        You do not have the required permissions to view this page. If you believe this is an error, please contact your administrator.
      </p>
      <div className="flex gap-4">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Go Back
        </Button>
        <Button onClick={() => navigate('/')}>
          <Icons.dashboard className="mr-2 h-4 w-4" />
          Dashboard
        </Button>
      </div>
    </motion.div>
  );
}
