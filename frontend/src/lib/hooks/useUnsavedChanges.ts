import { useEffect } from 'react';
import { useBlocker } from 'react-router-dom';

/**
 * Hook to prompt the user if they try to leave a page with unsaved changes.
 * Use for full page forms. For modals/drawers, handle closing logic directly in the UI.
 * 
 * @param isDirty Whether the form has unsaved changes
 */
export function useUnsavedChanges(isDirty: boolean) {
  // Block navigation within react-router
  useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname
  );

  // Block native browser navigation (refresh/close tab)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = ''; // Required for legacy browsers
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);
}
