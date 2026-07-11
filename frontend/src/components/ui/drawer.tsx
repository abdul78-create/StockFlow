import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "./Button";

export function Drawer({ open, onOpenChange, children }: { open?: boolean; onOpenChange?: (open: boolean) => void; children: React.ReactNode }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog.Root>
  );
}

export function DrawerContent({ 
  title, 
  description, 
  children, 
  className 
}: { 
  title?: string; 
  description?: string; 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <Dialog.Content 
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-full max-w-md flex flex-col gap-4 border-l border-gray-200 bg-white p-6 shadow-xl transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right duration-300 sm:max-w-lg", 
          className
        )}
      >
        <div className="flex flex-col space-y-1.5 pb-4 border-b border-gray-100">
          {title && <Dialog.Title className="text-lg font-semibold leading-none tracking-tight text-gray-900">{title}</Dialog.Title>}
          {description && <Dialog.Description className="text-sm text-gray-500">{description}</Dialog.Description>}
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
          {children}
        </div>
        
        <Dialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-gray-100 data-[state=open]:text-gray-500">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  );
}

export const DrawerTrigger = Dialog.Trigger;
export const DrawerClose = Dialog.Close;
