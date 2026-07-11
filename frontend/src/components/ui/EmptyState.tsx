import React from "react";
import { cn } from "./Button";

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action, 
  className 
}: { 
  icon?: React.ReactNode; 
  title: string; 
  description?: string; 
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("empty-state", className)}>
      {icon && <div className="empty-state-icon">{icon}</div>}
      <div className="space-y-1">
        <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
        {description && <p className="text-sm text-gray-500 max-w-sm mx-auto">{description}</p>}
      </div>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
