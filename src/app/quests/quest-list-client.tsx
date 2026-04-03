"use client";

import { useState, useCallback, useMemo } from "react";
import { QuestCard } from "@/components/quests/quest-card";
import { SearchInput } from "@/components/shared/search-input";
import { MultiSelectFilter } from "@/components/shared/multi-select-filter";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, X } from "lucide-react";
import type { QuestListItem } from "@/types";

type SortOption = "name-asc" | "name-desc" | "recent" | "oldest";

const sortLabels: Record<SortOption, string> = {
  "name-asc": "Name A-Z",
  "name-desc": "Name Z-A",
  "recent": "Recent First",
  "oldest": "Oldest First",
};

const STATUS_OPTIONS = [
  { value: "LEAD", label: "Lead" },
  { value: "ACTIVE", label: "Active" },
  { value: "COMPLETED", label: "Completed" },
  { value: "FAILED", label: "Failed" },
];

const DEFAULT_STATUSES = new Set(["LEAD", "ACTIVE"]);

interface QuestListClientProps {
  quests: QuestListItem[];
  headerActions?: React.ReactNode;
}

export function QuestListClient({ quests, headerActions }: QuestListClientProps) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("name-asc");
  const [statusFilters, setStatusFilters] = useState<Set<string>>(DEFAULT_STATUSES);

  const handleSearch = useCallback((value: string) => setSearch(value), []);

  const cycleSort = useCallback(() => {
    setSort((prev) => {
      const order: SortOption[] = ["name-asc", "name-desc", "recent", "oldest"];
      return order[(order.indexOf(prev) + 1) % order.length];
    });
  }, []);

  const clearFilters = useCallback(() => {
    setStatusFilters(DEFAULT_STATUSES);
  }, []);

  // "has filters" when something differs from the default Lead+Active selection
  const hasFilters = !(statusFilters.size === 2 && statusFilters.has("LEAD") && statusFilters.has("ACTIVE"));

  const results = useMemo(() => {
    let items = [...quests];

    // Search
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (quest) =>
          quest.name.toLowerCase().includes(q) ||
          quest.description?.toLowerCase().includes(q)
      );
    }

    // Status filter (empty set = show all)
    if (statusFilters.size > 0) {
      items = items.filter((quest) => statusFilters.has(quest.status));
    }

    // Sort
    items.sort((a, b) => {
      switch (sort) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "recent":
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case "oldest":
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        default:
          return 0;
      }
    });

    return items;
  }, [quests, search, sort, statusFilters]);

  return (
    <div className="space-y-4">
      {/* Search + Sort row */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          onChange={handleSearch}
          placeholder="Search by name or description..."
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
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {results.map((quest) => (
          <QuestCard key={quest.id} quest={quest} />
        ))}
      </div>
      {results.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No quests & goals match your search or filters.
        </p>
      )}
    </div>
  );
}
