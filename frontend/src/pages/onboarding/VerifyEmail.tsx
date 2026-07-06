import * as React from 'react';
import { useNavigate } from 'react-router-dom';

export function VerifyEmail() {
  const navigate = useNavigate();

  React.useEffect(() => {
    // Redirect instantly to workspace onboarding as backend verification doesn't exist
    navigate('/onboarding/workspace', { replace: true });
  }, [navigate]);

  return null;
}
