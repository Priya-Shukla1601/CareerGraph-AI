import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, hover, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-xl border border-slate-200 shadow-sm",
        hover && "hover:shadow-md hover:-translate-y-0.5 cursor-pointer",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn("px-6 py-4 border-b border-slate-100", className)}>
      {children}
    </div>
  );
}

export function CardBody({ children, className }: CardHeaderProps) {
  return <div className={cn("px-6 py-4", className)}>{children}</div>;
}
