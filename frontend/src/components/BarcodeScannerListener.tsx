import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export function BarcodeScannerListener() {
  const navigate = useNavigate();
  const bufferRef = React.useRef<string>('');
  const lastKeyTimeRef = React.useRef<number>(0);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore inputs inside form fields, unless they are very fast (scanner speed)
      const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
      
      const currentTime = Date.now();
      const diff = currentTime - lastKeyTimeRef.current;
      lastKeyTimeRef.current = currentTime;

      // Most barcode scanners send keys with < 50ms intervals.
      // If it's a slow human typing and we are in an input field, ignore it.
      if (isInput && diff > 50) {
        return;
      }

      if (e.key === 'Enter') {
        const barcode = bufferRef.current.trim();
        bufferRef.current = '';

        if (barcode.length >= 3) {
          // Trigger search and navigate
          api.get(`/search?q=${encodeURIComponent(barcode)}`)
            .then(({ data }) => {
              const matches = data.data?.products || [];
              if (matches.length > 0) {
                toast.success(`Scanned: ${matches[0].name}`);
                navigate(`/products/${matches[0].id}`);
              } else {
                toast.error(`No product found matching barcode: ${barcode}`);
              }
            })
            .catch(() => {
              toast.error('Error scanning barcode');
            });
        }
      } else if (e.key.length === 1) {
        // Clear buffer if the gap between keypresses is too large (indicating human typing)
        // If not in input, allow larger gaps so user can use physical scanner with slower configs.
        const maxGap = isInput ? 50 : 200;
        if (diff > maxGap) {
          bufferRef.current = '';
        }
        bufferRef.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return null;
}
export default BarcodeScannerListener;
