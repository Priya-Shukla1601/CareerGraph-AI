import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "purple"
  | "outline";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
  size?: "sm" | "md";
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-slate-100 text-slate-700",
  success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border border-amber-200",
  danger: "bg-red-50 text-red-600 border border-red-200",
  info: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  purple: "bg-violet-50 text-violet-700 border border-violet-200",
  outline: "border border-slate-300 text-slate-600",
};

export function Badge({
  children,
  variant = "default",
  className,
  size = "sm",
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function ScoreBadge({ score }: { score: number }) {
  const variant =
    score >= 85
      ? "success"
      : score >= 70
      ? "info"
      : score >= 55
      ? "warning"
      : "danger";
  return (
    <Badge variant={variant} size="md" className="font-semibold tabular-nums">
      {score}%
    </Badge>
  );
}
