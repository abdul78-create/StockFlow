import React from "react";
import { Card, CardContent } from "./Card";
import { cn } from "./Button";

export function StatCard({
  title,
  value,
  icon,
  trend,
  className
}: {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          {icon && <div className="text-gray-400">{icon}</div>}
        </div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {trend && (
          <p className={cn("text-xs mt-1 font-medium", trend.isPositive ? "text-green-600" : "text-red-600")}>
            {trend.value}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
