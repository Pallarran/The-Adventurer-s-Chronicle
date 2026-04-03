"use client";

import { useState, useCallback, useMemo } from "react";
import { SessionCard } from "@/components/sessions/session-card";
import { SearchInput } from "@/components/shared/search-input";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, X } from "lucide-react";
import type { SessionListItem } from "@/types";

type SortOption = "newest" | "oldest" | "number-desc" | "number-asc";

const sortLabels: Record<SortOption, string> = {
  "newest": "Newest First",
  "oldest": "Oldest First",
  "number-desc": "# Descending",
  "number-asc": "# Ascending",
};

const selectClass =
  "rounded-full border border-border bg-background px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground focus:outline-none";

interface SessionListClientProps {
  sessions: SessionListItem[];
  headerActions?: React.ReactNode;
}

export function SessionListClient({ sessions, headerActions }: SessionListClientProps) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");
  const [tagFilter, setTagFilter] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const tagSet = new Map<string, string>();
    sessions.forEach((s) =>
      s.tags.forEach((t) => tagSet.set(t.tag.id, t.tag.name))
    );
    return Array.from(tagSet, ([id, name]) => ({ id, name })).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [sessions]);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const cycleSort = useCallback(() => {
    setSort((prev) => {
      const order: SortOption[] = ["newest", "oldest", "number-desc", "number-asc"];
      const idx = order.indexOf(prev);
      return order[(idx + 1) % order.length];
    });
  }, []);

  const clearFilters = useCallback(() => {
    setTagFilter(null);
  }, []);

  const hasFilters = tagFilter !== null;

  const results = useMemo(() => {
    let items = [...sessions];

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (s) =>
          s.sessionNumber.toString().includes(q) ||
          s.title?.toLowerCase().includes(q) ||
          new Date(s.realDatePlayed).toLocaleDateString().includes(q)
      );
    }

    // Tag filter
    if (tagFilter) {
      items = items.filter((s) =>
        s.tags.some((t) => t.tag.id === tagFilter)
      );
    }

    // Sort
    items.sort((a, b) => {
      switch (sort) {
        case "newest":
          return new Date(b.realDatePlayed).getTime() - new Date(a.realDatePlayed).getTime();
        case "oldest":
          return new Date(a.realDatePlayed).getTime() - new Date(b.realDatePlayed).getTime();
        case "number-desc":
          return b.sessionNumber - a.sessionNumber;
        case "number-asc":
          return a.sessionNumber - b.sessionNumber;
        default:
          return 0;
      }
    });

    return items;
  }, [sessions, search, sort, tagFilter]);

  return (
    <div className="space-y-4">
      {/* Search + Sort row */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          onChange={handleSearch}
          placeholder="Search by title, number, or date..."
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

      {/* Filter row */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
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
      )}

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5">
        {results.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>
      {results.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No sessions match your search or filters.
        </p>
      )}
    </div>
  );
}
