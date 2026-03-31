"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Search, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface RelationOption {
  id: string;
  name: string;
  subtitle?: string;
}

interface RelationPickerProps {
  label: string;
  options: RelationOption[];
  selected: RelationOption[];
  onChange: (selected: RelationOption[]) => void;
  placeholder?: string;
  /** If true, only allows selecting one item */
  single?: boolean;
}

export function RelationPicker({
  label,
  options,
  selected,
  onChange,
  placeholder = "Search...",
  single = false,
}: RelationPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = options.filter(
    (opt) =>
      !selected.some((s) => s.id === opt.id) &&
      opt.name.toLowerCase().includes(search.toLowerCase())
  );

  const add = useCallback(
    (option: RelationOption) => {
      if (single) {
        onChange([option]);
      } else {
        onChange([...selected, option]);
      }
      setSearch("");
      if (single) setOpen(false);
    },
    [single, selected, onChange]
  );

  const remove = useCallback(
    (id: string) => {
      onChange(selected.filter((s) => s.id !== id));
    },
    [selected, onChange]
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger className={cn(buttonVariants({variant: "outline", size: "sm"}), "h-7 gap-1")}>
              <Plus className="h-3 w-3" />
              Add
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2" align="end">
            <div className="relative mb-2">
              <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={placeholder}
                className="h-8 pl-7 text-sm"
              />
            </div>
            <ScrollArea className="max-h-48">
              {filtered.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No results found.
                </p>
              ) : (
                <div className="space-y-0.5">
                  {filtered.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => add(option)}
                      className="flex w-full items-center rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                    >
                      <span className="truncate">{option.name}</span>
                      {option.subtitle && (
                        <span className="ml-auto text-xs text-muted-foreground truncate">
                          {option.subtitle}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </PopoverContent>
        </Popover>
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((item) => (
            <Badge
              key={item.id}
              variant="secondary"
              className="gap-1 pr-1"
            >
              {item.name}
              <button
                onClick={() => remove(item.id)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-background/50"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
