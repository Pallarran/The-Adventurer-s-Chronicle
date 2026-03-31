"use client";

import { useState, useCallback } from "react";
import { LocationCard } from "@/components/locations/location-card";
import { SearchInput } from "@/components/shared/search-input";
import type { LocationListItem } from "@/types";

interface LocationListClientProps {
  locations: LocationListItem[];
}

export function LocationListClient({ locations }: LocationListClientProps) {
  const [search, setSearch] = useState("");

  const filtered = locations.filter((l) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      l.name.toLowerCase().includes(q) ||
      l.type?.toLowerCase().includes(q) ||
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
        placeholder="Search locations..."
        className="max-w-sm"
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((location) => (
          <LocationCard key={location.id} location={location} />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No locations match your search.
        </p>
      )}
    </div>
  );
}
