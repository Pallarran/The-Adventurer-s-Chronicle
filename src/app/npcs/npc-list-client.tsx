"use client";

import { useState, useCallback, useMemo } from "react";
import { NpcCard } from "@/components/npcs/npc-card";
import { SearchInput } from "@/components/shared/search-input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, X } from "lucide-react";
import type { NpcListItem } from "@/types";
import type { NpcStatus } from "@/generated/prisma/client";

type SortOption = "name-asc" | "name-desc" | "recent" | "oldest";

const sortLabels: Record<SortOption, string> = {
  "name-asc": "Name A-Z",
  "name-desc": "Name Z-A",
  "recent": "Recent First",
  "oldest": "Oldest First",
};

const STATUS_OPTIONS: { value: NpcStatus; label: string; color: string }[] = [
  { value: "ALIVE", label: "Alive", color: "#4a9a5a" },
  { value: "DEAD", label: "Dead", color: "#9a4a4a" },
  { value: "MISSING", label: "Missing", color: "#9a8a4a" },
  { value: "UNKNOWN", label: "Unknown", color: "#6a6a7a" },
];

interface NpcListClientProps {
  npcs: NpcListItem[];
}

export function NpcListClient({ npcs }: NpcListClientProps) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("name-asc");
  const [statusFilter, setStatusFilter] = useState<NpcStatus | null>(null);
  const [partyOnly, setPartyOnly] = useState(false);
  const [tagFilter, setTagFilter] = useState<string | null>(null);

  // Extract unique tags from all NPCs
  const allTags = useMemo(() => {
    const tagSet = new Map<string, string>();
    npcs.forEach((npc) =>
      npc.tags.forEach((t) => tagSet.set(t.tag.id, t.tag.name))
    );
    return Array.from(tagSet, ([id, name]) => ({ id, name })).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [npcs]);

  const handleSearch = useCallback((value: string) => setSearch(value), []);

  const cycleSort = useCallback(() => {
    setSort((prev) => {
      const order: SortOption[] = ["name-asc", "name-desc", "recent", "oldest"];
      return order[(order.indexOf(prev) + 1) % order.length];
    });
  }, []);

  const clearFilters = useCallback(() => {
    setStatusFilter(null);
    setPartyOnly(false);
    setTagFilter(null);
  }, []);

  const hasFilters = statusFilter !== null || partyOnly || tagFilter !== null;

  const results = useMemo(() => {
    let items = [...npcs];

    // Search
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (npc) =>
          npc.name.toLowerCase().includes(q) ||
          npc.aliasTitle?.toLowerCase().includes(q) ||
          npc.classRole?.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter) {
      items = items.filter((npc) => npc.status === statusFilter);
    }

    // Party member filter
    if (partyOnly) {
      items = items.filter((npc) => npc.partyMember);
    }

    // Tag filter
    if (tagFilter) {
      items = items.filter((npc) =>
        npc.tags.some((t) => t.tag.id === tagFilter)
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
  }, [npcs, search, sort, statusFilter, partyOnly, tagFilter]);

  return (
    <div className="space-y-4">
      {/* Search + Sort row */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          onChange={handleSearch}
          placeholder="Search by name, alias, or role..."
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
        <span className="ml-auto text-xs text-muted-foreground">
          {results.length} NPC{results.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Party member toggle */}
        <button
          onClick={() => setPartyOnly(!partyOnly)}
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${
            partyOnly
              ? "border-gold/40 bg-gold/10 text-gold"
              : "border-border text-muted-foreground hover:border-gold/30 hover:text-foreground"
          }`}
        >
          Party Members
        </button>

        {/* Status filters */}
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() =>
              setStatusFilter(statusFilter === opt.value ? null : opt.value)
            }
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${
              statusFilter === opt.value
                ? "border-transparent"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
            style={
              statusFilter === opt.value
                ? { backgroundColor: `${opt.color}20`, color: opt.color, borderColor: `${opt.color}40` }
                : undefined
            }
          >
            {opt.label}
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
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((npc) => (
          <NpcCard key={npc.id} npc={npc} />
        ))}
      </div>
      {results.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No NPCs match your filters.
        </p>
      )}
    </div>
  );
}
