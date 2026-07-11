import React from "react";
import { cn } from "./Button";

export function FormLayout({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      {children}
    </div>
  );
}

export function FormGroup({ 
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
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-6", className)}>
      {(title || description) && (
        <div className="md:col-span-1">
          {title && <h3 className="text-sm font-medium text-gray-900">{title}</h3>}
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
      )}
      <div className="md:col-span-2 space-y-4">
        {children}
      </div>
    </div>
  );
}
