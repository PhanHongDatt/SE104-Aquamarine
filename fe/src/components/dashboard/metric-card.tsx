import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "default" | "warning" | "danger" | "accent";
  trend?: { value: number; label: string };
  className?: string;
}

const variantConfig = {
  default: {
    bg: "bg-white",
    iconBg: "bg-soft/20",
    iconColor: "text-primary",
    valuColor: "text-gray-900",
    badge: "bg-soft/20 text-primary",
  },
  warning: {
    bg: "bg-white",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    valuColor: "text-amber-700",
    badge: "bg-amber-50 text-amber-600",
  },
  danger: {
    bg: "bg-white",
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
    valuColor: "text-red-600",
    badge: "bg-red-50 text-red-500",
  },
  accent: {
    bg: "bg-white",
    iconBg: "bg-accent/10",
    iconColor: "text-accent",
    valuColor: "text-accent",
    badge: "bg-accent/10 text-accent",
  },
};

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
  trend,
  className,
}: MetricCardProps) {
  const config = variantConfig[variant];

  return (
    <div className={cn("metric-card hover:shadow-card-hover group", className)}>
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105",
            config.iconBg
          )}
        >
          <Icon className={cn("w-5 h-5", config.iconColor)} />
        </div>

        {trend && (
          <span
            className={cn(
              "text-xs font-medium px-2 py-1 rounded-lg",
              trend.value >= 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
            )}
          >
            {trend.value >= 0 ? "+" : ""}{trend.value}% {trend.label}
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className={cn("text-3xl font-bold tracking-tight", config.valuColor)}>{value}</p>
        <p className="text-sm font-medium text-gray-700 mt-1">{title}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}
