"use client";

import { useState, useCallback, useMemo } from "react";
import { LocationCard } from "@/components/locations/location-card";
import { SearchInput } from "@/components/shared/search-input";
import { MultiSelectFilter } from "@/components/shared/multi-select-filter";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, X } from "lucide-react";
import type { LocationListItem } from "@/types";

type SortOption = "name-asc" | "name-desc" | "recent" | "oldest";

const sortLabels: Record<SortOption, string> = {
  "name-asc": "Name A-Z",
  "name-desc": "Name Z-A",
  "recent": "Recent First",
  "oldest": "Oldest First",
};

interface LocationListClientProps {
  locations: LocationListItem[];
  headerActions?: React.ReactNode;
}

export function LocationListClient({ locations, headerActions }: LocationListClientProps) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("name-asc");
  const [typeFilters, setTypeFilters] = useState<Set<string>>(new Set());

  // Extract unique types
  const typeOptions = useMemo(() => {
    const types = new Set<string>();
    locations.forEach((l) => {
      if (l.type) types.add(l.type);
    });
    return Array.from(types).sort().map((t) => ({ value: t, label: t }));
  }, [locations]);

  const handleSearch = useCallback((value: string) => setSearch(value), []);

  const cycleSort = useCallback(() => {
    setSort((prev) => {
      const order: SortOption[] = ["name-asc", "name-desc", "recent", "oldest"];
      return order[(order.indexOf(prev) + 1) % order.length];
    });
  }, []);

  const clearFilters = useCallback(() => {
    setTypeFilters(new Set());
  }, []);

  const hasFilters = typeFilters.size > 0;

  const results = useMemo(() => {
    let items = [...locations];

    // Search
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.type?.toLowerCase().includes(q)
      );
    }

    // Type filter
    if (typeFilters.size > 0) {
      items = items.filter((l) => l.type !== null && typeFilters.has(l.type));
    }

    // Sort
    items.sort((a, b) => {
      switch (sort) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "recent":
          return (b.lastAppearanceSession?.sessionNumber ?? 0) - (a.lastAppearanceSession?.sessionNumber ?? 0);
        case "oldest":
          return (a.lastAppearanceSession?.sessionNumber ?? 0) - (b.lastAppearanceSession?.sessionNumber ?? 0);
        default:
          return 0;
      }
    });

    return items;
  }, [locations, search, sort, typeFilters]);

  return (
    <div className="space-y-4">
      {/* Search + Sort row */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          onChange={handleSearch}
          placeholder="Search by name or type..."
          className="max-w-sm"
        />
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs"
          onClick={cycleSort}
        >
          <ArrowUpDown className="h-3.5 w-3.5" />
          {sortLabels[sort]}
        </Button>
        <div className="ml-auto">{headerActions}</div>
      </div>

      {/* Filter dropdowns */}
      <div className="flex flex-wrap items-center gap-2">
        {typeOptions.length > 0 && (
          <MultiSelectFilter
            label="Types"
            options={typeOptions}
            selected={typeFilters}
            onChange={setTypeFilters}
          />
        )}

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
        {results.map((location) => (
          <LocationCard key={location.id} location={location} />
        ))}
      </div>
      {results.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No locations match your search or filters.
        </p>
      )}
    </div>
  );
}
