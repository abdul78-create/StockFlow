import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLocation, useNavigate } from 'react-router-dom';

export function KeyboardShortcutsHelp() {
  const [open, setOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Show shortcuts modal on "?" key (when not typing in inputs/textareas)
      if (e.key === '?' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setOpen(o => !o);
      }

      // 2. Ctrl+N or Cmd+N for quick-creating items based on route context
      if (e.key === 'n' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const path = location.pathname;
        if (path.includes('/products')) {
          navigate('/products/new');
        } else if (path.includes('/purchase-orders')) {
          navigate('/purchase-orders/new');
        } else if (path.includes('/sales-orders')) {
          navigate('/sales-orders/new');
        } else if (path.includes('/quotations')) {
          navigate('/quotations/new');
        } else {
          // Default: open products page or quick palette
          navigate('/products/new');
        }
      }

      // 3. Ctrl+S or Cmd+S to submit active forms (trigger click on save buttons)
      if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const saveButton = document.getElementById('save-btn') as HTMLButtonElement | null;
        if (saveButton && !saveButton.disabled) {
          saveButton.click();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [location.pathname, navigate]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4 border-b pb-3 text-sm">
            <span className="font-semibold">Action</span>
            <span className="font-semibold text-right">Shortcut</span>
          </div>

          <ShortcutRow action="Global search / Command palette" keys={['⌘ K', 'or', 'Ctrl K']} />
          <ShortcutRow action="Create new item (context-aware)" keys={['⌘ N', 'or', 'Ctrl N']} />
          <ShortcutRow action="Save current form" keys={['⌘ S', 'or', 'Ctrl S']} />
          <ShortcutRow action="Close modal / dialog" keys={['ESC']} />
          <ShortcutRow action="Show this help menu" keys={['?']} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ShortcutRow({ action, keys }: { action: string; keys: string[] }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{action}</span>
      <div className="flex items-center gap-1">
        {keys.map((key, idx) => (
          <React.Fragment key={idx}>
            {key === 'or' ? (
              <span className="text-[11px] text-muted-foreground mx-1">or</span>
            ) : (
              <kbd className="h-5 items-center rounded border bg-muted px-1.5 font-mono text-[11px] font-medium shadow-sm">
                {key}
              </kbd>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
