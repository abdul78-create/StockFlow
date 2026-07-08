import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const shortcuts = [
  { key: '?', description: 'Show keyboard shortcuts' },
  { key: 'c', description: 'Create new record (in list views)' },
  { key: 's', description: 'Focus search bar' },
  { key: 'esc', description: 'Close current modal or drawer' },
];

export function KeyboardShortcutsModal() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      // key can be "?" or shift+"/"
      if (e.key === '?') {
        setOpen(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Navigate the application faster with these shortcuts.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-3">
          {shortcuts.map((s, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{s.description}</span>
              <kbd className="px-2 py-1 bg-muted rounded-md text-xs font-medium font-mono text-foreground border border-border/50 shadow-sm">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
