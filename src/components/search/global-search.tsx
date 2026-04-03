"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ScrollText, Users, MapPin, Shield, Package, Compass } from "lucide-react";
import {
  CommandDialog,
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import type { SearchResult } from "@/app/api/search/route";

const typeConfig = {
  session: { icon: ScrollText, label: "Sessions", href: (id: string) => `/sessions/${id}` },
  npc: { icon: Users, label: "NPCs", href: (id: string) => `/npcs/${id}` },
  location: { icon: MapPin, label: "Locations", href: (id: string) => `/locations/${id}` },
  organization: { icon: Shield, label: "Organizations", href: (id: string) => `/organizations/${id}` },
  item: { icon: Package, label: "Items", href: (id: string) => `/items/${id}` },
  quest: { icon: Compass, label: "Quests & Goals", href: (id: string) => `/quests/${id}` },
} as const;

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Debounced search
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          setResults(await res.json());
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = useCallback(
    (result: SearchResult) => {
      const config = typeConfig[result.type];
      router.push(config.href(result.id));
      onOpenChange(false);
      setQuery("");
      setResults([]);
    },
    [router, onOpenChange]
  );

  // Reset on close
  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  // Group results by type
  const grouped = results.reduce(
    (acc, result) => {
      if (!acc[result.type]) acc[result.type] = [];
      acc[result.type].push(result);
      return acc;
    },
    {} as Record<string, SearchResult[]>
  );

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Global Search"
      description="Search across sessions, NPCs, locations, and organizations"
    >
      <Command shouldFilter={false}>
        <CommandInput
          placeholder="Search sessions, NPCs, locations..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {query.length >= 2 && !loading && results.length === 0 && (
            <CommandEmpty>No results found.</CommandEmpty>
          )}
          {loading && query.length >= 2 && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Searching...
            </div>
          )}
          {Object.entries(grouped).map(([type, items]) => {
            const config = typeConfig[type as keyof typeof typeConfig];
            return (
              <CommandGroup key={type} heading={config.label}>
                {items.map((item) => {
                  const Icon = config.icon;
                  return (
                    <CommandItem
                      key={`${item.type}-${item.id}`}
                      value={`${item.type}-${item.id}`}
                      onSelect={() => handleSelect(item)}
                      className="cursor-pointer"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span>{item.name}</span>
                      {item.subtitle && (
                        <span className="ml-auto text-xs text-muted-foreground">
                          {item.subtitle}
                        </span>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            );
          })}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
