import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';
import { motion } from 'framer-motion';
import { pageTransition } from '@/lib/motion';

export function VerifyEmail() {
  const navigate = useNavigate();

  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="rounded-xl border bg-card text-card-foreground shadow p-8 text-center"
    >
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-6">
        <Icons.mail className="h-8 w-8 text-primary" />
      </div>
      
      <h1 className="text-2xl font-semibold tracking-tight mb-2">
        Check your email
      </h1>
      <p className="text-sm text-muted-foreground mb-8">
        We've sent a temporary verification link. Please check your inbox and click the link to verify your account.
      </p>

      {/* For demo purposes, we allow skipping this step */}
      <Button 
        className="w-full" 
        onClick={() => navigate('/onboarding/workspace')}
      >
        I verified my email
      </Button>

      <div className="mt-6 text-center text-sm">
        Didn't receive the email?{' '}
        <button className="underline hover:text-primary">
          Click to resend
        </button>
      </div>
    </motion.div>
  );
}
