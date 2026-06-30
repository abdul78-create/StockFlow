import * as React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icons } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { pageTransition } from '@/lib/motion';

export function Unauthorized() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = () => {
    // Pass the attempted URL so we can redirect them back after login
    navigate('/login', { state: { from: location.state?.from || '/' } });
  };

  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4"
    >
      <div className="rounded-full bg-muted p-6 mb-6">
        <Icons.user className="h-12 w-12 text-muted-foreground" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight mb-2">Session Expired</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        Your session has expired or you are not logged in. Please log in again to access this page.
      </p>
      <Button size="lg" onClick={handleLogin}>
        <Icons.logout className="mr-2 h-4 w-4 rotate-180" />
        Return to Login
      </Button>
    </motion.div>
  );
}
