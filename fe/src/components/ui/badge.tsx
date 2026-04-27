import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

const variantClasses = {
  default: "bg-soft/20 text-primary border-soft/40",
  success: "bg-green-50 text-green-700 border-green-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  danger: "bg-red-50 text-red-600 border-red-200",
  info: "bg-accent/10 text-accent border-accent/30",
};

export const Badge = ({ variant = "default", className, children, ...props }: BadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border",
      variantClasses[variant],
      className
    )}
    {...props}
  >
    {children}
  </span>
);
