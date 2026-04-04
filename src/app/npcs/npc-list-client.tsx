"use client";

import { useState, useCallback, useMemo } from "react";
import { NpcCard } from "@/components/npcs/npc-card";
import { SearchInput } from "@/components/shared/search-input";
import { MultiSelectFilter } from "@/components/shared/multi-select-filter";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, X } from "lucide-react";
import type { NpcListItem } from "@/types";

type SortOption = "name-asc" | "name-desc" | "recent" | "oldest";

const sortLabels: Record<SortOption, string> = {
  "name-asc": "Name A-Z",
  "name-desc": "Name Z-A",
  "recent": "Recent First",
  "oldest": "Oldest First",
};

const STATUS_OPTIONS = [
  { value: "ALIVE", label: "Alive" },
  { value: "DEAD", label: "Dead" },
  { value: "MISSING", label: "Missing" },
  { value: "UNKNOWN", label: "Unknown" },
];

const STANCE_OPTIONS = [
  { value: "ALLIED", label: "Allied" },
  { value: "FRIENDLY", label: "Friendly" },
  { value: "NEUTRAL", label: "Neutral" },
  { value: "SUSPICIOUS", label: "Suspicious" },
  { value: "HOSTILE", label: "Hostile" },
];

const PARTY_OPTIONS = [
  { value: "party", label: "Party Only" },
  { value: "non-party", label: "Non-Party" },
];

interface NpcListClientProps {
  npcs: NpcListItem[];
  headerActions?: React.ReactNode;
}

export function NpcListClient({ npcs, headerActions }: NpcListClientProps) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("name-asc");
  const [statusFilters, setStatusFilters] = useState<Set<string>>(new Set());
  const [stanceFilters, setStanceFilters] = useState<Set<string>>(new Set());
  const [partyFilters, setPartyFilters] = useState<Set<string>>(new Set());

  const handleSearch = useCallback((value: string) => setSearch(value), []);

  const cycleSort = useCallback(() => {
    setSort((prev) => {
      const order: SortOption[] = ["name-asc", "name-desc", "recent", "oldest"];
      return order[(order.indexOf(prev) + 1) % order.length];
    });
  }, []);

  const clearFilters = useCallback(() => {
    setStatusFilters(new Set());
    setStanceFilters(new Set());
    setPartyFilters(new Set());
  }, []);

  const hasFilters = statusFilters.size > 0 || stanceFilters.size > 0 || partyFilters.size > 0;

  const results = useMemo(() => {
    let items = [...npcs];

    // Search
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (npc) =>
          npc.name.toLowerCase().includes(q) ||
          npc.aliasTitle?.toLowerCase().includes(q) ||
          npc.race?.toLowerCase().includes(q) ||
          npc.classRole?.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilters.size > 0) {
      items = items.filter((npc) => statusFilters.has(npc.status));
    }

    // Stance filter
    if (stanceFilters.size > 0) {
      items = items.filter((npc) => stanceFilters.has(npc.alignmentStance));
    }

    // Party member filter
    if (partyFilters.size > 0) {
      items = items.filter((npc) => {
        if (partyFilters.has("party") && partyFilters.has("non-party")) return true;
        if (partyFilters.has("party")) return npc.partyMember;
        return !npc.partyMember;
      });
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
  }, [npcs, search, sort, statusFilters, stanceFilters, partyFilters]);

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
        <div className="ml-auto">{headerActions}</div>
      </div>

      {/* Filter dropdowns */}
      <div className="flex flex-wrap items-center gap-2">
        <MultiSelectFilter
          label="Statuses"
          options={STATUS_OPTIONS}
          selected={statusFilters}
          onChange={setStatusFilters}
        />
        <MultiSelectFilter
          label="Stances"
          options={STANCE_OPTIONS}
          selected={stanceFilters}
          onChange={setStanceFilters}
        />
        <MultiSelectFilter
          label="NPCs"
          options={PARTY_OPTIONS}
          selected={partyFilters}
          onChange={setPartyFilters}
        />

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
        {results.map((npc) => (
          <NpcCard key={npc.id} npc={npc} />
        ))}
      </div>
      {results.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No NPCs match your search or filters.
        </p>
      )}
    </div>
  );
}
