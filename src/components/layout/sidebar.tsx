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
  Settings,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { NavLink } from "./nav-link";
import { useSidebarStats } from "./use-sidebar-stats";
import { CampaignSwitcher } from "./campaign-switcher";
import { useSidebarMode } from "./sidebar-mode-context";
import { cn } from "@/lib/utils";

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
  const { mode } = useSidebarMode();
  const collapsed = mode === "icon";
  const hidden = mode === "hidden";

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ease-out",
        hidden ? "hidden" : "hidden md:flex",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo / App Title */}
      <Link
        href="/"
        className={cn(
          "flex h-14 items-center hover:bg-accent/50 transition-colors",
          collapsed ? "justify-center px-2" : "gap-2.5 px-4"
        )}
      >
        <Image
          src="/logo-icon.png"
          alt="The Adventurer's Chronicle"
          width={32}
          height={32}
          className="rounded-md shrink-0"
        />
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground tracking-wide">
              The Adventurer&apos;s
            </span>
            <span className="text-xs text-gold font-medium -mt-0.5">
              Chronicle
            </span>
          </div>
        )}
      </Link>

      {/* Campaign Switcher */}
      <CampaignSwitcher activeCampaignId={activeCampaignId} collapsed={collapsed} />

      {/* Navigation */}
      <nav className={cn("flex-1 space-y-0.5 py-3", collapsed ? "px-2" : "px-3")}>
        {mainNavItems.map((item) => (
          <NavLink
            key={item.href}
            {...item}
            count={getCount(item.href)}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {/* Bottom: Settings */}
      <div
        className={cn(
          "border-t border-sidebar-border py-3",
          collapsed ? "px-2" : "px-3"
        )}
      >
        <NavLink
          href="/settings"
          label="Settings"
          icon={Settings}
          collapsed={collapsed}
        />
      </div>
    </aside>
  );
}
