"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "default" | "warning" | "danger" | "accent";
  trend?: { value: number; label: string };
  animate?: boolean;
  delay?: number;
  className?: string;
}

const variantConfig = {
  default: {
    iconBg: "bg-primary/8 border-primary/15",
    iconColor: "text-primary",
    valueColor: "text-gray-900",
    glow: "rgba(23,12,121,0.12)",
    gradientFrom: "from-primary/5",
  },
  warning: {
    iconBg: "bg-amber-50 border-amber-200/50",
    iconColor: "text-amber-600",
    valueColor: "text-amber-700",
    glow: "rgba(217,119,6,0.15)",
    gradientFrom: "from-amber-50/60",
  },
  danger: {
    iconBg: "bg-red-50 border-red-200/50",
    iconColor: "text-red-500",
    valueColor: "text-red-600",
    glow: "rgba(239,68,68,0.12)",
    gradientFrom: "from-red-50/60",
  },
  accent: {
    iconBg: "bg-accent/10 border-accent/20",
    iconColor: "text-accent",
    valueColor: "text-accent",
    glow: "rgba(86,182,198,0.18)",
    gradientFrom: "from-accent/5",
  },
};

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const duration = 800;
    const start = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) rafRef.current = requestAnimationFrame(start);
    };
    rafRef.current = requestAnimationFrame(start);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  return <>{display}</>;
}

export function MetricCard({
  title, value, subtitle, icon: Icon,
  variant = "default", trend, animate = true, delay = 0, className,
}: MetricCardProps) {
  const config = variantConfig[variant];
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 });
  const isNumeric = typeof value === "number";

  return (
    <motion.div
      ref={ref}
      initial={animate ? { opacity: 0, y: 24 } : false}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{
        y: -4,
        boxShadow: `0 16px 40px ${config.glow}, 0 0 0 1px rgba(86,182,198,0.12)`,
      }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-soft/20 bg-white p-5 cursor-default",
        "transition-[box-shadow] duration-300",
        "shadow-[0_2px_12px_rgba(23,12,121,0.06)]",
        className
      )}
    >
      {/* Gradient tint */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br to-transparent opacity-60 pointer-events-none",
        config.gradientFrom
      )} />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <motion.div
            whileHover={{ scale: 1.12, rotate: -5 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "w-11 h-11 rounded-xl border flex items-center justify-center",
              config.iconBg
            )}
          >
            <Icon className={cn("w-5 h-5", config.iconColor)} />
          </motion.div>

          {trend && (
            <span className={cn(
              "text-xs font-semibold px-2.5 py-1 rounded-lg",
              trend.value >= 0
                ? "bg-green-50 text-green-600 border border-green-200/50"
                : "bg-red-50 text-red-500 border border-red-200/50"
            )}>
              {trend.value >= 0 ? "+" : ""}{trend.value}%
            </span>
          )}
        </div>

        <p className={cn("text-3xl font-bold tracking-tight tabular-nums", config.valueColor)}>
          {isNumeric && inView ? <AnimatedNumber value={value as number} /> : value}
        </p>
        <p className="text-sm font-medium text-gray-700 mt-1.5">{title}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </motion.div>
  );
}

/* ── Skeleton variant ── */
export function MetricCardSkeleton() {
  return (
    <div className="rounded-2xl border border-soft/20 bg-white p-5 shadow-sm animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-xl skeleton" />
        <div className="w-14 h-6 rounded-lg skeleton" />
      </div>
      <div className="w-16 h-8 rounded-lg skeleton mb-2" />
      <div className="w-28 h-4 rounded skeleton mb-1" />
      <div className="w-20 h-3 rounded skeleton" />
    </div>
  );
}
