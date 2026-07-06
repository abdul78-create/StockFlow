import * as React from 'react';
import JsBarcode from 'jsbarcode';
import { Button } from './ui/button';

export function BarcodeSVG({ value }: { value: string }) {
  const svgRef = React.useRef<SVGSVGElement | null>(null);

  React.useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format: 'CODE128',
          width: 2,
          height: 50,
          displayValue: true,
        });
      } catch (err) {
        console.error('JsBarcode failed:', err);
      }
    }
  }, [value]);

  const handlePrint = () => {
    const printContent = svgRef.current?.outerHTML;
    if (!printContent) return;

    const windowUrl = 'about:blank';
    const uniqueName = new Date().getTime();
    const windowName = `Print_${uniqueName}`;
    const printWindow = window.open(windowUrl, windowName, 'left=50000,top=50000,width=0,height=0');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Label</title>
            <style>
              body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
              svg { max-width: 100%; }
            </style>
          </head>
          <body>
            ${printContent}
            <script>
              window.onload = function() {
                window.print();
                window.close();
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 border p-4 rounded-lg bg-background w-fit">
      <svg ref={svgRef} />
      <Button variant="outline" size="sm" onClick={handlePrint}>
        Print Barcode Label
      </Button>
    </div>
  );
}
export default BarcodeSVG;
