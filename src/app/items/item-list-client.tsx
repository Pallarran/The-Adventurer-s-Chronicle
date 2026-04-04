"use client";

import { useState, useCallback, useMemo } from "react";
import { ItemCard } from "@/components/items/item-card";
import { SearchInput } from "@/components/shared/search-input";
import { MultiSelectFilter } from "@/components/shared/multi-select-filter";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ChevronRight, X } from "lucide-react";
import { GEM } from "@/lib/colors";
import type { ItemListItem } from "@/types";

type SortOption = "name-asc" | "name-desc" | "recent" | "oldest";

const sortLabels: Record<SortOption, string> = {
  "name-asc": "Name A-Z",
  "name-desc": "Name Z-A",
  "recent": "Recent First",
  "oldest": "Oldest First",
};

const RARITY_ORDER = ["Common", "Uncommon", "Rare", "Very Rare", "Legendary", "Artifact"];

const SECTIONS: { key: string; label: string; color: string; sold: boolean }[] = [
  { key: "inventory", label: "Inventory", color: GEM.jade, sold: false },
  { key: "sold", label: "Sold", color: GEM.moonstone, sold: true },
];

const selectClass =
  "rounded-full border border-border bg-background px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground focus:outline-none";

interface ItemListClientProps {
  items: ItemListItem[];
  headerActions?: React.ReactNode;
}

export function ItemListClient({ items, headerActions }: ItemListClientProps) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("name-asc");
  const [typeFilters, setTypeFilters] = useState<Set<string>>(new Set());
  const [rarityFilters, setRarityFilters] = useState<Set<string>>(new Set());
  const [attunementFilter, setAttunementFilter] = useState<string>("");
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["inventory"]));

  const typeOptions = useMemo(() => {
    const types = new Set<string>();
    items.forEach((i) => {
      if (i.type) types.add(i.type);
    });
    return Array.from(types).sort().map((t) => ({ value: t, label: t }));
  }, [items]);

  const rarityOptions = useMemo(() => {
    const rarities = new Set<string>();
    items.forEach((i) => {
      if (i.rarity) rarities.add(i.rarity);
    });
    return Array.from(rarities)
      .sort((a, b) => RARITY_ORDER.indexOf(a) - RARITY_ORDER.indexOf(b))
      .map((r) => ({ value: r, label: r }));
  }, [items]);

  const handleSearch = useCallback((value: string) => setSearch(value), []);

  const cycleSort = useCallback(() => {
    setSort((prev) => {
      const order: SortOption[] = ["name-asc", "name-desc", "recent", "oldest"];
      return order[(order.indexOf(prev) + 1) % order.length];
    });
  }, []);

  const clearFilters = useCallback(() => {
    setTypeFilters(new Set());
    setRarityFilters(new Set());
    setAttunementFilter("");
  }, []);

  const toggleSection = useCallback((key: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const hasFilters = typeFilters.size > 0 || rarityFilters.size > 0 || attunementFilter !== "";
  const isSearching = search.length > 0 || hasFilters;

  // Filter + sort, then group by sold status
  const grouped = useMemo(() => {
    let filtered = [...items];

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.type?.toLowerCase().includes(q) ||
          i.rarity?.toLowerCase().includes(q)
      );
    }

    if (typeFilters.size > 0) {
      filtered = filtered.filter((i) => i.type !== null && typeFilters.has(i.type));
    }

    if (rarityFilters.size > 0) {
      filtered = filtered.filter((i) => i.rarity !== null && rarityFilters.has(i.rarity));
    }

    if (attunementFilter === "yes") {
      filtered = filtered.filter((i) => i.attunement);
    } else if (attunementFilter === "no") {
      filtered = filtered.filter((i) => !i.attunement);
    }

    filtered.sort((a, b) => {
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

    const inventory: ItemListItem[] = [];
    const sold: ItemListItem[] = [];
    for (const item of filtered) {
      if (item.sold) sold.push(item);
      else inventory.push(item);
    }
    return { inventory, sold };
  }, [items, search, sort, typeFilters, rarityFilters, attunementFilter]);

  const totalResults = grouped.inventory.length + grouped.sold.length;

  return (
    <div className="space-y-4">
      {/* Search + Sort row */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          onChange={handleSearch}
          placeholder="Search by name, type, or rarity..."
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

        {rarityOptions.length > 0 && (
          <MultiSelectFilter
            label="Rarities"
            options={rarityOptions}
            selected={rarityFilters}
            onChange={setRarityFilters}
          />
        )}

        <select
          value={attunementFilter}
          onChange={(e) => setAttunementFilter(e.target.value)}
          className={selectClass}
        >
          <option value="">Attunement</option>
          <option value="yes">Requires Attunement</option>
          <option value="no">No Attunement</option>
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

      {/* Collapsible sections */}
      <div className="space-y-2">
        {SECTIONS.map(({ key, label, color, sold }) => {
          const sectionItems = sold ? grouped.sold : grouped.inventory;
          const isOpen = openSections.has(key);

          // Hide empty sections when searching/filtering
          if (isSearching && sectionItems.length === 0) return null;

          return (
            <div key={key} className="rounded-lg border border-border bg-card/50">
              <button
                type="button"
                onClick={() => toggleSection(key)}
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
                  {sectionItems.length}
                </span>
              </button>

              {isOpen && (
                <div className="border-t border-border px-4 py-3">
                  {sectionItems.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
                      {sectionItems.map((item) => (
                        <ItemCard key={item.id} item={item} />
                      ))}
                    </div>
                  ) : (
                    <p className="py-4 text-center text-xs text-muted-foreground">
                      No {label.toLowerCase()} items
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
          No items match your search or filters.
        </p>
      )}
    </div>
  );
}
