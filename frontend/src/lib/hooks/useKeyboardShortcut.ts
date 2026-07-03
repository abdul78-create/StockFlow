import { useEffect, useCallback } from 'react';

export function useKeyboardShortcut(
  key: string,
  callback: (e: KeyboardEvent) => void,
  options?: {
    ctrlKey?: boolean;
    metaKey?: boolean;
    shiftKey?: boolean;
    preventDefault?: boolean;
    ignoreInForms?: boolean; // Don't trigger if user is typing in an input
  }
) {
  const {
    ctrlKey = false,
    metaKey = false,
    shiftKey = false,
    preventDefault = true,
    ignoreInForms = true,
  } = options || {};

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      // Check if user is typing in an input/textarea
      if (ignoreInForms) {
        const target = event.target as HTMLElement;
        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable
        ) {
          return;
        }
      }

      const isKeyMatch = event.key.toLowerCase() === key.toLowerCase();
      const isCtrlMatch = event.ctrlKey === ctrlKey;
      const isMetaMatch = event.metaKey === metaKey;
      const isShiftMatch = event.shiftKey === shiftKey;

      if (isKeyMatch && isCtrlMatch && isMetaMatch && isShiftMatch) {
        if (preventDefault) {
          event.preventDefault();
        }
        callback(event);
      }
    },
    [key, callback, ctrlKey, metaKey, shiftKey, preventDefault, ignoreInForms]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);
}
