import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '@/lib/icons';
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

export function GlobalQuickCreate() {
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="hidden sm:flex h-9 gap-1 px-3">
          <Icons.add className="h-4 w-4" />
          <span>Create</span>
          <Icons.chevronDown className="h-3 w-3 ml-1 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal text-xs text-muted-foreground uppercase tracking-wider">
          Quick Actions
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => navigate('/products/new')}>
            <Icons.products className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>New Product</span>
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              P
            </kbd>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="font-normal text-xs text-muted-foreground uppercase tracking-wider">
          Inventory
        </DropdownMenuLabel>
        
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => navigate('/inventory?action=receive')}>
            <Icons.download className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Receive Stock</span>
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              R
            </kbd>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/inventory?action=transfer')}>
            <Icons.refresh className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Transfer Stock</span>
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              T
            </kbd>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/inventory?action=adjust')}>
            <Icons.edit className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Adjust Stock</span>
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              N
            </kbd>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="font-normal text-xs text-muted-foreground uppercase tracking-wider">
          Orders & Entities
        </DropdownMenuLabel>
        
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => navigate('/purchase-orders/new')}>
            <Icons.purchaseOrders className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>New Purchase Order</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/sales-orders/new')}>
            <Icons.salesOrders className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>New Sales Order</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        

      </DropdownMenuContent>
    </DropdownMenu>
  );
}
