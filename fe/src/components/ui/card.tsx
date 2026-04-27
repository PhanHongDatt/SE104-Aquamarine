import * as React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "warm";
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", className, children, ...props }, ref) => {
    const variantClass = {
      default: "bg-white border border-soft/20 shadow-card",
      glass: "bg-white/80 backdrop-blur-sm border border-soft/30 shadow-card",
      warm: "bg-warm border border-warm-dark/30 shadow-sm",
    }[variant];

    return (
      <div
        ref={ref}
        className={cn("rounded-2xl p-6 transition-shadow duration-200", variantClass, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

export const CardHeader = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mb-4", className)} {...props}>{children}</div>
);

export const CardTitle = ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn("text-base font-semibold text-gray-800", className)} {...props}>{children}</h3>
);

export const CardContent = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("", className)} {...props}>{children}</div>
);
