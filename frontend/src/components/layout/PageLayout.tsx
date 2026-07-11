import React from "react";
import { cn } from "../ui/Button";

export function PageLayout({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col h-full", className)}>
      {children}
    </div>
  );
}

export function PageHeader({ 
  title, 
  description, 
  actions, 
  className 
}: { 
  title: string; 
  description?: string; 
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-8 pb-4", className)}>
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">{title}</h1>
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}

export function PageContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex-1 p-8 pt-4 overflow-auto", className)}>
      {children}
    </div>
  );
}
