"use client";

import { useState, useCallback, useMemo } from "react";
import { OrganizationCard } from "@/components/organizations/organization-card";
import { SearchInput } from "@/components/shared/search-input";
import { MultiSelectFilter } from "@/components/shared/multi-select-filter";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, X } from "lucide-react";
import type { OrganizationListItem } from "@/types";

type SortOption = "name-asc" | "name-desc" | "recent" | "oldest";

const sortLabels: Record<SortOption, string> = {
  "name-asc": "Name A-Z",
  "name-desc": "Name Z-A",
  "recent": "Recent First",
  "oldest": "Oldest First",
};

const STANCE_OPTIONS = [
  { value: "ALLIED", label: "Allied" },
  { value: "FRIENDLY", label: "Friendly" },
  { value: "NEUTRAL", label: "Neutral" },
  { value: "SUSPICIOUS", label: "Suspicious" },
  { value: "HOSTILE", label: "Hostile" },
  { value: "UNKNOWN", label: "Unknown" },
];

const selectClass =
  "rounded-full border border-border bg-background px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground focus:outline-none";

interface OrgListClientProps {
  organizations: OrganizationListItem[];
  headerActions?: React.ReactNode;
}

export function OrgListClient({ organizations, headerActions }: OrgListClientProps) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("name-asc");
  const [stanceFilters, setStanceFilters] = useState<Set<string>>(new Set());
  const [typeFilters, setTypeFilters] = useState<Set<string>>(new Set());
  const [tagFilter, setTagFilter] = useState<string | null>(null);

  // Extract unique types and tags
  const typeOptions = useMemo(() => {
    const types = new Set<string>();
    organizations.forEach((o) => {
      if (o.type) types.add(o.type);
    });
    return Array.from(types).sort().map((t) => ({ value: t, label: t }));
  }, [organizations]);

  const allTags = useMemo(() => {
    const tagSet = new Map<string, string>();
    organizations.forEach((o) =>
      o.tags.forEach((t) => tagSet.set(t.tag.id, t.tag.name))
    );
    return Array.from(tagSet, ([id, name]) => ({ id, name })).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [organizations]);

  const handleSearch = useCallback((value: string) => setSearch(value), []);

  const cycleSort = useCallback(() => {
    setSort((prev) => {
      const order: SortOption[] = ["name-asc", "name-desc", "recent", "oldest"];
      return order[(order.indexOf(prev) + 1) % order.length];
    });
  }, []);

  const clearFilters = useCallback(() => {
    setStanceFilters(new Set());
    setTypeFilters(new Set());
    setTagFilter(null);
  }, []);

  const hasFilters = stanceFilters.size > 0 || typeFilters.size > 0 || tagFilter !== null;

  const results = useMemo(() => {
    let items = [...organizations];

    // Search
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (org) =>
          org.name.toLowerCase().includes(q) ||
          org.type?.toLowerCase().includes(q)
      );
    }

    // Stance filter
    if (stanceFilters.size > 0) {
      items = items.filter((org) => stanceFilters.has(org.alignmentStance));
    }

    // Type filter
    if (typeFilters.size > 0) {
      items = items.filter((org) => org.type !== null && typeFilters.has(org.type));
    }

    // Tag filter
    if (tagFilter) {
      items = items.filter((org) =>
        org.tags.some((t) => t.tag.id === tagFilter)
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
  }, [organizations, search, sort, stanceFilters, typeFilters, tagFilter]);

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
        <MultiSelectFilter
          label="Stances"
          options={STANCE_OPTIONS}
          selected={stanceFilters}
          onChange={setStanceFilters}
        />

        {typeOptions.length > 0 && (
          <MultiSelectFilter
            label="Types"
            options={typeOptions}
            selected={typeFilters}
            onChange={setTypeFilters}
          />
        )}

        {allTags.length > 0 && (
          <select
            value={tagFilter ?? ""}
            onChange={(e) => setTagFilter(e.target.value || null)}
            className={selectClass}
          >
            <option value="">All Tags</option>
            {allTags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
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
        {results.map((org) => (
          <OrganizationCard key={org.id} organization={org} />
        ))}
      </div>
      {results.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No organizations match your search or filters.
        </p>
      )}
    </div>
  );
}
