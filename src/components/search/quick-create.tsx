"use client";

import { useRouter } from "next/navigation";
import { Plus, ScrollText, Users, MapPin, Shield, Package, Compass, Link2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const createItems = [
  { label: "New Session", icon: ScrollText, href: "/sessions/new" },
  { label: "New NPC", icon: Users, href: "/npcs/new" },
  { label: "New Location", icon: MapPin, href: "/locations/new" },
  { label: "New Organization", icon: Shield, href: "/organizations/new" },
  { label: "New Item", icon: Package, href: "/items/new" },
  { label: "New Quest", icon: Compass, href: "/quests/new" },
  { label: "New Tool Link", icon: Link2, href: "/tools" },
];

export function QuickCreate() {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <Plus className="h-4 w-4" />
        <span className="sr-only">Quick create</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Create New</DropdownMenuLabel>
          {createItems.map((item) => {
            const Icon = item.icon;
            return (
              <DropdownMenuItem
                key={item.href}
                onClick={() => router.push(item.href)}
                className="cursor-pointer gap-2"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
