import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  label: string;
  value: string | number;
  change: string;
  positive: boolean;
  icon: LucideIcon;
  color?: "indigo" | "violet" | "emerald" | "amber";
}

const colorMap = {
  indigo: { bg: "bg-indigo-50", icon: "text-indigo-600", ring: "ring-indigo-100" },
  violet: { bg: "bg-violet-50", icon: "text-violet-600", ring: "ring-violet-100" },
  emerald: { bg: "bg-emerald-50", icon: "text-emerald-600", ring: "ring-emerald-100" },
  amber: { bg: "bg-amber-50", icon: "text-amber-600", ring: "ring-amber-100" },
};

export function KPICard({
  label,
  value,
  change,
  positive,
  icon: Icon,
  color = "indigo",
}: KPICardProps) {
  const c = colorMap[color];
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center ring-4",
            c.bg,
            c.ring
          )}
        >
          <Icon className={cn("w-5 h-5", c.icon)} />
        </div>
        <span
          className={cn(
            "text-xs font-semibold px-2 py-1 rounded-full",
            positive
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-600"
          )}
        >
          {change}
        </span>
      </div>
      <p className="text-3xl font-extrabold text-slate-900 tabular-nums">
        {value}
      </p>
      <p className="text-sm text-slate-500 mt-1">{label}</p>
    </div>
  );
}
