import * as React from 'react';
import { useNavigate } from 'react-router-dom';

export function VerifyEmail() {
  const navigate = useNavigate();

  React.useEffect(() => {
    navigate('/onboarding/workspace', { replace: true });
  }, [navigate]);

  return null;
}
