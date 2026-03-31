import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-card/50 px-6 py-16 text-center",
        className
      )}
    >
      {/* Subtle decorative gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gold/[0.02] to-transparent" />

      <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 ring-1 ring-gold/10">
        <Icon className="h-7 w-7 text-gold/80" />
      </div>
      <h3 className="relative mt-4 text-lg font-semibold text-foreground">{title}</h3>
      <p className="relative mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {children && <div className="relative mt-5">{children}</div>}
    </div>
  );
}
