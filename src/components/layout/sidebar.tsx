"use client";

import {
  LayoutDashboard,
  ScrollText,
  Users,
  MapPin,
  Shield,
  Package,
  Compass,
  Swords,
  Link2,
} from "lucide-react";
import Image from "next/image";
import { NavLink } from "./nav-link";
import { useSidebarStats } from "./use-sidebar-stats";
import { CampaignSwitcher } from "./campaign-switcher";

export const mainNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/sessions", label: "Sessions", icon: ScrollText },
  { href: "/npcs", label: "NPCs", icon: Users },
  { href: "/locations", label: "Locations", icon: MapPin },
  { href: "/organizations", label: "Organizations", icon: Shield },
  { href: "/items", label: "Items", icon: Package },
  { href: "/quests", label: "Quests & Goals", icon: Compass },
  { href: "/character", label: "Character", icon: Swords },
  { href: "/tools", label: "Links & Tools", icon: Link2 },
];

export function Sidebar({ activeCampaignId }: { activeCampaignId: string | null }) {
  const { getCount } = useSidebarStats();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-sidebar-border bg-sidebar md:flex">
      {/* Logo / App Title */}
      <div className="flex h-14 items-center gap-2.5 px-4">
        <Image
          src="/logo-icon.png"
          alt="The Adventurer's Chronicle"
          width={32}
          height={32}
          className="rounded-md"
        />
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground tracking-wide">
            The Adventurer&apos;s
          </span>
          <span className="text-xs text-gold font-medium -mt-0.5">
            Chronicle
          </span>
        </div>
      </div>

      {/* Campaign Switcher */}
      <CampaignSwitcher activeCampaignId={activeCampaignId} />

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-3 py-3">
        {mainNavItems.map((item) => (
          <NavLink key={item.href} {...item} count={getCount(item.href)} />
        ))}
      </nav>
    </aside>
  );
}
