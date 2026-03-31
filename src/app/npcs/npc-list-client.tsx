"use client";

import { useState, useCallback } from "react";
import { NpcCard } from "@/components/npcs/npc-card";
import { SearchInput } from "@/components/shared/search-input";
import type { NpcListItem } from "@/types";

interface NpcListClientProps {
  npcs: NpcListItem[];
}

export function NpcListClient({ npcs }: NpcListClientProps) {
  const [search, setSearch] = useState("");

  const filtered = npcs.filter((npc) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      npc.name.toLowerCase().includes(q) ||
      npc.aliasTitle?.toLowerCase().includes(q) ||
      false
    );
  });

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
  }, []);

  return (
    <div className="space-y-4">
      <SearchInput
        onChange={handleSearch}
        placeholder="Search NPCs..."
        className="max-w-sm"
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((npc) => (
          <NpcCard key={npc.id} npc={npc} />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No NPCs match your search.
        </p>
      )}
    </div>
  );
}
