"use client";

import { useState, useCallback, useMemo } from "react";
import { SessionCard } from "@/components/sessions/session-card";
import { SearchInput } from "@/components/shared/search-input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, X } from "lucide-react";
import type { SessionListItem } from "@/types";

type SortOption = "newest" | "oldest" | "number-desc" | "number-asc";

const sortLabels: Record<SortOption, string> = {
  "newest": "Newest First",
  "oldest": "Oldest First",
  "number-desc": "# Descending",
  "number-asc": "# Ascending",
};

interface SessionListClientProps {
  sessions: SessionListItem[];
  headerActions?: React.ReactNode;
}

export function SessionListClient({ sessions, headerActions }: SessionListClientProps) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");

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
  }, [sessions, search, sort]);

  return (
    <div className="space-y-4">
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

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {results.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>
      {results.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No sessions match your search.
        </p>
      )}
    </div>
  );
}
