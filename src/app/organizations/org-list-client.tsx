"use client";

import { useState, useCallback } from "react";
import { OrganizationCard } from "@/components/organizations/organization-card";
import { SearchInput } from "@/components/shared/search-input";
import type { OrganizationListItem } from "@/types";

interface OrgListClientProps {
  organizations: OrganizationListItem[];
}

export function OrgListClient({ organizations }: OrgListClientProps) {
  const [search, setSearch] = useState("");

  const filtered = organizations.filter((org) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return org.name.toLowerCase().includes(q);
  });

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
  }, []);

  return (
    <div className="space-y-4">
      <SearchInput
        onChange={handleSearch}
        placeholder="Search organizations..."
        className="max-w-sm"
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((org) => (
          <OrganizationCard key={org.id} organization={org} />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No organizations match your search.
        </p>
      )}
    </div>
  );
}
