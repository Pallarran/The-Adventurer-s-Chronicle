"use client";

import { Check, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const OPTIONS: Array<{
  value: string;
  label: string;
  description: string;
  icon: typeof Moon;
}> = [
  {
    value: "dark",
    label: "Dark",
    description: "Dark parchment with gold accents.",
    icon: Moon,
  },
  {
    value: "light",
    label: "Light",
    description: "Light parchment, easier on the eyes in daylight.",
    icon: Sun,
  },
];

export function ThemeModeForm() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-foreground">Theme</h2>
        <p className="text-sm text-muted-foreground">
          Choose between dark and light appearance.
        </p>
      </div>

      <div
        role="radiogroup"
        aria-label="Theme mode"
        className="grid gap-2 sm:grid-cols-2"
      >
        {OPTIONS.map((opt) => {
          const selected = theme === opt.value;
          const Icon = opt.icon;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setTheme(opt.value)}
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
    </div>
  );
}
