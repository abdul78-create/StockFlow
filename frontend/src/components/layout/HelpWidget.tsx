import * as React from 'react';
import { HelpCircle, Book, Keyboard, LifeBuoy, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function HelpWidget() {
  return (
    <div className="fixed bottom-6 right-6 z-40">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            size="icon" 
            className="h-12 w-12 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:scale-105"
          >
            <HelpCircle className="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 mb-2">
          <DropdownMenuLabel>Need Help?</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem className="cursor-pointer">
              <Book className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Documentation</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}>
              <Keyboard className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Command Palette</span>
              <span className="ml-auto text-xs text-muted-foreground tracking-widest opacity-60">⌘K</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem className="cursor-pointer">
              <LifeBuoy className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Contact Support</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Bug className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Report a Bug</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
