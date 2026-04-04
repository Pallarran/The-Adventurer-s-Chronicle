"use client";

import { useState, useCallback, useMemo } from "react";
import { QuestCard } from "@/components/quests/quest-card";
import { SearchInput } from "@/components/shared/search-input";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ChevronRight } from "lucide-react";
import { QUEST_STATUS_COLORS } from "@/lib/colors";
import type { QuestListItem } from "@/types";
import type { QuestStatus } from "@/generated/prisma/client";

type SortOption = "name-asc" | "name-desc" | "recent" | "oldest";

const sortLabels: Record<SortOption, string> = {
  "name-asc": "Name A-Z",
  "name-desc": "Name Z-A",
  "recent": "Recent First",
  "oldest": "Oldest First",
};

const SECTIONS: { status: QuestStatus; label: string; color: string }[] = [
  { status: "ACTIVE", label: "Active", color: QUEST_STATUS_COLORS.ACTIVE },
  { status: "LEAD", label: "Leads", color: QUEST_STATUS_COLORS.LEAD },
  { status: "COMPLETED", label: "Completed", color: QUEST_STATUS_COLORS.COMPLETED },
  { status: "FAILED", label: "Failed / Abandoned", color: QUEST_STATUS_COLORS.FAILED },
];

const DEFAULT_OPEN = new Set<string>(["ACTIVE", "LEAD"]);

interface QuestListClientProps {
  quests: QuestListItem[];
}

export function QuestListClient({ quests }: QuestListClientProps) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("recent");
  const [openSections, setOpenSections] = useState<Set<string>>(DEFAULT_OPEN);

  const handleSearch = useCallback((value: string) => setSearch(value), []);

  const cycleSort = useCallback(() => {
    setSort((prev) => {
      const order: SortOption[] = ["name-asc", "name-desc", "recent", "oldest"];
      return order[(order.indexOf(prev) + 1) % order.length];
    });
  }, []);

  const toggleSection = useCallback((status: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  }, []);

  const isSearching = search.length > 0;

  // Filter + sort, then group by status
  const grouped = useMemo(() => {
    let items = [...quests];

    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (quest) =>
          quest.name.toLowerCase().includes(q) ||
          quest.description?.toLowerCase().includes(q)
      );
    }

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

    const map = new Map<QuestStatus, QuestListItem[]>();
    for (const section of SECTIONS) {
      map.set(section.status, []);
    }
    for (const quest of items) {
      map.get(quest.status)?.push(quest);
    }
    return map;
  }, [quests, search, sort]);

  const totalResults = Array.from(grouped.values()).reduce((sum, arr) => sum + arr.length, 0);

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
      </div>

      {/* Collapsible sections */}
      <div className="space-y-2">
        {SECTIONS.map(({ status, label, color }) => {
          const items = grouped.get(status) ?? [];
          const isOpen = openSections.has(status);

          // Hide empty sections when searching
          if (isSearching && items.length === 0) return null;

          return (
            <div key={status} className="rounded-lg border border-border bg-card/50">
              <button
                type="button"
                onClick={() => toggleSection(status)}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left transition-colors hover:bg-muted/50"
              >
                <ChevronRight
                  className="h-4 w-4 text-muted-foreground transition-transform duration-200"
                  style={{ transform: isOpen ? "rotate(90deg)" : undefined }}
                />
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm font-semibold">{label}</span>
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: `${color}20`,
                    color,
                  }}
                >
                  {items.length}
                </span>
              </button>

              {isOpen && (
                <div className="border-t border-border px-4 py-3">
                  {items.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {items.map((quest) => (
                        <QuestCard key={quest.id} quest={quest} />
                      ))}
                    </div>
                  ) : (
                    <p className="py-4 text-center text-xs text-muted-foreground">
                      No {label.toLowerCase()} quests
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isSearching && totalResults === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No quests & goals match your search.
        </p>
      )}
    </div>
  );
}
