import React from "react";
import { cn } from "./Button";

export function Section({ 
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
    <section className={cn("space-y-4", className)}>
      {(title || description) && (
        <div>
          {title && <h2 className="text-lg font-medium text-gray-900">{title}</h2>}
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
      )}
      {children}
    </section>
  );
}
