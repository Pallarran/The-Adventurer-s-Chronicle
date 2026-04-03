"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { NavLink } from "./nav-link";
import { mainNavItems, utilityNavItems } from "./sidebar";
import { useSidebarStats } from "./use-sidebar-stats";
import { CampaignSwitcher } from "./campaign-switcher";

export function MobileSidebar({ activeCampaignId }: { activeCampaignId: string | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { getCount } = useSidebarStats();

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        className="md:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" showCloseButton={false} className="w-60 p-0 bg-sidebar">
          <SheetTitle className="sr-only">Navigation</SheetTitle>

          {/* Logo */}
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

          <Separator className="bg-sidebar-border" />

          {/* Campaign Switcher */}
          <div className="pt-2">
            <CampaignSwitcher activeCampaignId={activeCampaignId} />
          </div>

          <nav className="flex-1 space-y-0.5 px-3 py-3">
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Campaign
            </p>
            {mainNavItems.map((item) => (
              <NavLink key={item.href} {...item} count={getCount(item.href)} />
            ))}
          </nav>

          <Separator className="bg-sidebar-border" />

          <nav className="space-y-0.5 px-3 py-3">
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Utilities
            </p>
            {utilityNavItems.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
