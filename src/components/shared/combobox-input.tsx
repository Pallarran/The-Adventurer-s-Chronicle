"use client";

import { useState, useRef, useCallback } from "react";
import { ChevronDown, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface ComboboxInputProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  onAddOption?: (option: string) => void;
  onRemoveOption?: (option: string) => void;
  placeholder?: string;
  className?: string;
}

export function ComboboxInput({
  value,
  onChange,
  options,
  onAddOption,
  onRemoveOption,
  placeholder,
  className,
}: ComboboxInputProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [confirmingRemove, setConfirmingRemove] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase()),
  );

  const exactMatch = options.some(
    (opt) => opt.toLowerCase() === search.toLowerCase(),
  );
  const showCreate = search.trim() && !exactMatch && onAddOption;

  const select = useCallback(
    (opt: string) => {
      onChange(opt);
      setSearch("");
      setOpen(false);
    },
    [onChange],
  );

  const handleAdd = useCallback(() => {
    if (!onAddOption || !search.trim()) return;
    const trimmed = search.trim();
    onAddOption(trimmed);
    select(trimmed);
  }, [onAddOption, search, select]);

  const handleRemoveClick = useCallback(
    (opt: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!onRemoveOption) return;
      if (confirmingRemove === opt) {
        // Second click — confirm removal
        onRemoveOption(opt);
        setConfirmingRemove(null);
        if (value.toLowerCase() === opt.toLowerCase()) {
          onChange("");
        }
      } else {
        // First click — ask for confirmation
        setConfirmingRemove(opt);
      }
    },
    [onRemoveOption, confirmingRemove, value, onChange],
  );

  return (
    <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) setConfirmingRemove(null); }}>
      <PopoverTrigger
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "hover:border-ring/40",
          !value && "text-muted-foreground",
          className,
        )}
      >
        <span className="truncate">{value || placeholder || "Select..."}</span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--popover-trigger-width)] p-2"
        align="start"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          inputRef.current?.focus();
        }}
      >
        <Input
          ref={inputRef}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setConfirmingRemove(null); }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (filtered.length === 1) {
                select(filtered[0]);
              } else if (showCreate) {
                handleAdd();
              }
            }
          }}
          placeholder="Search or type custom..."
          className="h-8 text-sm mb-2"
        />
        <div className="max-h-48 overflow-y-auto space-y-0.5">
            {filtered.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => select(opt)}
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent cursor-pointer",
                  value === opt && "bg-accent/60 font-medium",
                )}
              >
                <span>{opt}</span>
                {onRemoveOption && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => handleRemoveClick(opt, e)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleRemoveClick(opt, e as unknown as React.MouseEvent);
                      }
                    }}
                    className={cn(
                      "ml-2 rounded px-1 py-0.5 text-xs transition-colors",
                      confirmingRemove === opt
                        ? "text-destructive bg-destructive/10 font-medium"
                        : "text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10",
                    )}
                    aria-label={confirmingRemove === opt ? `Confirm remove ${opt}` : `Remove ${opt}`}
                  >
                    {confirmingRemove === opt ? (
                      "Remove?"
                    ) : (
                      <X className="h-3 w-3" />
                    )}
                  </span>
                )}
              </button>
            ))}
            {showCreate && (
              <button
                type="button"
                onClick={handleAdd}
                className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-gold hover:bg-accent cursor-pointer"
              >
                <Plus className="h-3 w-3" />
                Add &quot;{search.trim()}&quot;
              </button>
            )}
            {filtered.length === 0 && !showCreate && (
              <p className="py-3 text-center text-sm text-muted-foreground">
                No options found.
              </p>
            )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
