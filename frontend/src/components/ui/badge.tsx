import React from "react";
import { cn } from "./Button";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "blue" | "green" | "yellow" | "red" | "gray" | "purple";
}

export function Badge({ className, variant = "gray", ...props }: BadgeProps) {
  const variants = {
    blue: "badge-blue",
    green: "badge-green",
    yellow: "badge-yellow",
    red: "badge-red",
    gray: "badge-gray",
    purple: "badge-purple",
  };

  return (
    <div className={cn("badge", variants[variant], className)} {...props} />
  );
}
