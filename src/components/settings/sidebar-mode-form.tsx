"use client";

import { Check, PanelLeft, PanelLeftClose, PanelLeftDashed } from "lucide-react";
import { useSidebarMode, type SidebarMode } from "@/components/layout/sidebar-mode-context";
import { cn } from "@/lib/utils";

const OPTIONS: Array<{
  value: SidebarMode;
  label: string;
  description: string;
  icon: typeof PanelLeft;
}> = [
  {
    value: "full",
    label: "Full",
    description: "Show labels and counts (default).",
    icon: PanelLeft,
  },
  {
    value: "icon",
    label: "Icon only",
    description: "Compact strip with tooltips on hover.",
    icon: PanelLeftDashed,
  },
  {
    value: "hidden",
    label: "Hidden",
    description: "Access navigation via the menu button in the top bar.",
    icon: PanelLeftClose,
  },
];

export function SidebarModeForm() {
  const { mode, setMode } = useSidebarMode();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-foreground">Sidebar Display</h2>
        <p className="text-sm text-muted-foreground">
          Choose how the navigation sidebar appears on desktop.
        </p>
      </div>

      <div
        role="radiogroup"
        aria-label="Sidebar display mode"
        className="grid gap-2 sm:grid-cols-3"
      >
        {OPTIONS.map((opt) => {
          const selected = mode === opt.value;
          const Icon = opt.icon;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setMode(opt.value)}
              className={cn(
                "group relative flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-all",
                "hover:border-gold/40 hover:bg-accent/40",
                selected
                  ? "border-gold/60 bg-gold/5 shadow-[0_0_12px_rgba(201,170,85,0.08)]"
                  : "border-border"
              )}
            >
              {selected && (
                <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-background">
                  <Check className="h-3 w-3" />
                </span>
              )}
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-colors",
                  selected ? "text-gold" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <div className="space-y-0.5">
                <p
                  className={cn(
                    "text-sm font-medium",
                    selected ? "text-gold" : "text-foreground"
                  )}
                >
                  {opt.label}
                </p>
                <p className="text-xs text-muted-foreground">{opt.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground/70">
        Mobile devices always hide the sidebar regardless of this setting.
      </p>
    </div>
  );
}
