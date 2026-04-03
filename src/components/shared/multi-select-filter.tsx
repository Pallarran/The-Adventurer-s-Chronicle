"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface FilterOption {
  value: string;
  label: string;
}

interface MultiSelectFilterProps {
  label: string;
  options: FilterOption[];
  selected: Set<string>;
  onChange: (selected: Set<string>) => void;
}

export function MultiSelectFilter({
  label,
  options,
  selected,
  onChange,
}: MultiSelectFilterProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const allSelected = selected.size === 0 || selected.size === options.length;

  const toggle = useCallback(
    (value: string) => {
      const next = new Set(selected);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      // If all are now selected, clear to represent "all"
      if (next.size === options.length) {
        onChange(new Set());
      } else {
        onChange(next);
      }
    },
    [selected, onChange, options.length]
  );

  const selectAll = useCallback(() => {
    onChange(new Set());
  }, [onChange]);

  // Display text
  let displayText: string;
  if (allSelected) {
    displayText = `All ${label}`;
  } else if (selected.size <= 2) {
    displayText = options
      .filter((o) => selected.has(o.value))
      .map((o) => o.label)
      .join(", ");
  } else {
    displayText = `${selected.size} ${label.toLowerCase()}`;
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground focus:outline-none"
      >
        {displayText}
        <ChevronDown className="h-3 w-3" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 min-w-[160px] rounded-lg border border-border bg-popover p-1 shadow-md">
          {/* Select All */}
          <button
            type="button"
            onClick={selectAll}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors hover:bg-accent"
          >
            <Check
              className={`h-3 w-3 ${allSelected ? "opacity-100" : "opacity-0"}`}
            />
            All {label}
          </button>

          <div className="my-1 h-px bg-border" />

          {/* Options */}
          {options.map((opt) => {
            const isSelected = allSelected || selected.has(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggle(opt.value)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors hover:bg-accent"
              >
                <Check
                  className={`h-3 w-3 ${isSelected && !allSelected ? "opacity-100" : "opacity-0"}`}
                />
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
