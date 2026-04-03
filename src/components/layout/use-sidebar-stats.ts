"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getSidebarStats } from "@/lib/actions/campaign-stats";

type SidebarStats = { sessions: number; npcs: number; locations: number; organizations: number; items: number; quests: number };

const STAT_HREF_MAP: Record<string, keyof SidebarStats> = {
  "/sessions": "sessions",
  "/npcs": "npcs",
  "/locations": "locations",
  "/organizations": "organizations",
  "/items": "items",
  "/quests": "quests",
};

export function useSidebarStats() {
  const pathname = usePathname();
  const [stats, setStats] = useState<SidebarStats | null>(null);

  useEffect(() => {
    getSidebarStats().then(setStats).catch(() => {});
  }, [pathname]);

  return { stats, getCount: (href: string) => {
    const key = STAT_HREF_MAP[href];
    return key && stats ? stats[key] : undefined;
  }};
}
