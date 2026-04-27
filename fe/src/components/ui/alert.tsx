"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";

interface AlertProps {
  variant?: "success" | "error" | "warning" | "info";
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

const configs = {
  success: { icon: CheckCircle2, bg: "bg-green-50", border: "border-green-200", text: "text-green-800", icon_cls: "text-green-500" },
  error: { icon: AlertCircle, bg: "bg-red-50", border: "border-red-200", text: "text-red-800", icon_cls: "text-red-500" },
  warning: { icon: AlertTriangle, bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800", icon_cls: "text-amber-500" },
  info: { icon: Info, bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-800", icon_cls: "text-blue-500" },
};

export const Alert = ({ variant = "info", title, message, onClose, className }: AlertProps) => {
  const { icon: Icon, bg, border, text, icon_cls } = configs[variant];

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl border animate-fade-in",
        bg, border, className
      )}
    >
      <Icon className={cn("w-5 h-5 mt-0.5 flex-shrink-0", icon_cls)} />
      <div className="flex-1 min-w-0">
        {title && <p className={cn("font-semibold text-sm", text)}>{title}</p>}
        <p className={cn("text-sm", text)}>{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Đóng thông báo"
          className={cn("p-0.5 rounded-lg transition-colors hover:bg-black/10", text)}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
