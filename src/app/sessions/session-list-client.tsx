"use client";

import { useState, useCallback } from "react";
import { SessionCard } from "@/components/sessions/session-card";
import { SearchInput } from "@/components/shared/search-input";
import type { SessionListItem } from "@/types";

interface SessionListClientProps {
  sessions: SessionListItem[];
}

export function SessionListClient({ sessions }: SessionListClientProps) {
  const [search, setSearch] = useState("");

  const filtered = sessions.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.sessionNumber.toString().includes(q) ||
      s.title?.toLowerCase().includes(q) ||
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
        placeholder="Search sessions..."
        className="max-w-sm"
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No sessions match your search.
        </p>
      )}
    </div>
  );
}
