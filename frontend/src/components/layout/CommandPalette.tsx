import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { Icons } from '@/lib/icons';
import { navigationConfig } from '@/config/navigation';
import { useTheme } from '@/components/theme-provider';

export function CommandPalette({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const { setTheme } = useTheme();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [setOpen]);

  const runCommand = React.useCallback(
    (command: () => unknown) => {
      setOpen(false);
      command();
    },
    [setOpen]
  );

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Navigation">
          {navigationConfig.map((item) => {
            if (item.children) {
              return item.children.map((child) => (
                <CommandItem
                  key={child.title}
                  value={`Go to ${child.title}`}
                  onSelect={() => runCommand(() => navigate(child.href!))}
                >
                  <Icons.chevronRight className="mr-2 h-4 w-4" />
                  <span>Go to {child.title}</span>
                </CommandItem>
              ));
            }
            return (
              <CommandItem
                key={item.title}
                value={`Go to ${item.title}`}
                onSelect={() => runCommand(() => navigate(item.href!))}
              >
                {item.icon && React.createElement(Icons[item.icon], { className: "mr-2 h-4 w-4" })}
                <span>Go to {item.title}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => runCommand(() => navigate('/products/new'))}>
            <Icons.add className="mr-2 h-4 w-4" />
            <span>Create Product</span>
            <CommandShortcut>P</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/purchase-orders/new'))}>
            <Icons.add className="mr-2 h-4 w-4" />
            <span>Create Purchase Order</span>
            <CommandShortcut>O</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/sales-orders/new'))}>
            <Icons.add className="mr-2 h-4 w-4" />
            <span>Create Sales Order</span>
            <CommandShortcut>S</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Inventory">
          <CommandItem onSelect={() => runCommand(() => navigate('/inventory?action=receive'))}>
            <Icons.download className="mr-2 h-4 w-4" />
            <span>Receive Stock</span>
            <CommandShortcut>R</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/inventory?action=transfer'))}>
            <Icons.refresh className="mr-2 h-4 w-4" />
            <span>Transfer Stock</span>
            <CommandShortcut>T</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/inventory?action=adjust'))}>
            <Icons.edit className="mr-2 h-4 w-4" />
            <span>Adjust Stock</span>
            <CommandShortcut>N</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Theme">
          <CommandItem onSelect={() => runCommand(() => setTheme('light'))}>
            <Icons.sun className="mr-2 h-4 w-4" />
            <span>Light Mode</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme('dark'))}>
            <Icons.moon className="mr-2 h-4 w-4" />
            <span>Dark Mode</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme('system'))}>
            <Icons.laptop className="mr-2 h-4 w-4" />
            <span>System Theme</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
