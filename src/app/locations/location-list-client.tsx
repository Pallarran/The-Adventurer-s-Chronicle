"use client";

import { useState, useCallback, useMemo } from "react";
import { LocationCard } from "@/components/locations/location-card";
import { SearchInput } from "@/components/shared/search-input";
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
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [tagFilter, setTagFilter] = useState<string | null>(null);

  // Extract unique types and tags
  const allTypes = useMemo(() => {
    const types = new Set<string>();
    locations.forEach((l) => {
      if (l.type) types.add(l.type);
    });
    return Array.from(types).sort();
  }, [locations]);

  const allTags = useMemo(() => {
    const tagSet = new Map<string, string>();
    locations.forEach((l) =>
      l.tags.forEach((t) => tagSet.set(t.tag.id, t.tag.name))
    );
    return Array.from(tagSet, ([id, name]) => ({ id, name })).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [locations]);

  const handleSearch = useCallback((value: string) => setSearch(value), []);

  const cycleSort = useCallback(() => {
    setSort((prev) => {
      const order: SortOption[] = ["name-asc", "name-desc", "recent", "oldest"];
      return order[(order.indexOf(prev) + 1) % order.length];
    });
  }, []);

  const clearFilters = useCallback(() => {
    setTypeFilter(null);
    setTagFilter(null);
  }, []);

  const hasFilters = typeFilter !== null || tagFilter !== null;

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
    if (typeFilter) {
      items = items.filter((l) => l.type === typeFilter);
    }

    // Tag filter
    if (tagFilter) {
      items = items.filter((l) =>
        l.tags.some((t) => t.tag.id === tagFilter)
      );
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
  }, [locations, search, sort, typeFilter, tagFilter]);

  return (
    <div className="space-y-4">
      {/* Search + Sort row */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          onChange={handleSearch}
          placeholder="Search locations..."
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

      {/* Filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Type filter */}
        {allTypes.length > 0 &&
          allTypes.map((type) => (
            <button
              key={type}
              onClick={() =>
                setTypeFilter(typeFilter === type ? null : type)
              }
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${
                typeFilter === type
                  ? "border-gold/40 bg-gold/10 text-gold"
                  : "border-border text-muted-foreground hover:border-gold/30 hover:text-foreground"
              }`}
            >
              {type}
            </button>
          ))}

        {/* Tag filter */}
        {allTags.length > 0 && (
          <select
            value={tagFilter ?? ""}
            onChange={(e) => setTagFilter(e.target.value || null)}
            className="rounded-full border border-border bg-background px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground focus:outline-none"
          >
            <option value="">All Tags</option>
            {allTags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
        )}

        {/* Clear all */}
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
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {results.map((location) => (
          <LocationCard key={location.id} location={location} />
        ))}
      </div>
      {results.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No locations match your filters.
        </p>
      )}
    </div>
  );
}
