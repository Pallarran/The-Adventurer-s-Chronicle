"use client";

import {
  LayoutDashboard,
  ScrollText,
  Users,
  MapPin,
  Shield,
  Swords,
  Link2,
} from "lucide-react";
import { NavLink } from "./nav-link";
import { Separator } from "@/components/ui/separator";

const mainNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/sessions", label: "Sessions", icon: ScrollText },
  { href: "/npcs", label: "NPCs", icon: Users },
  { href: "/locations", label: "Locations", icon: MapPin },
  { href: "/organizations", label: "Organizations", icon: Shield },
  { href: "/character", label: "Character", icon: Swords },
];

const utilityNavItems = [
  { href: "/tools", label: "Links & Tools", icon: Link2 },
];

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo / App Title */}
      <div className="flex h-14 items-center gap-2 px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gold/10">
          <ScrollText className="h-4 w-4 text-gold" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground tracking-wide">
            The Adventurer&apos;s
          </span>
          <span className="text-xs text-gold font-medium -mt-0.5">
            Chronicle
          </span>
        </div>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-3">
        {mainNavItems.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
      </nav>

      <Separator className="bg-sidebar-border" />

      {/* Utility Navigation */}
      <nav className="space-y-1 px-3 py-3">
        {utilityNavItems.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
      </nav>
    </aside>
  );
}
