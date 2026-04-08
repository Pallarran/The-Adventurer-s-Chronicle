"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Menu, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { NavLink } from "./nav-link";
import { mainNavItems } from "./sidebar";
import { useSidebarStats } from "./use-sidebar-stats";
import { useSidebarMode } from "./sidebar-mode-context";
import { CampaignSwitcher } from "./campaign-switcher";
import { cn } from "@/lib/utils";

export function MobileSidebar({ activeCampaignId }: { activeCampaignId: string | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { getCount } = useSidebarStats();
  const { mode } = useSidebarMode();

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        className={cn(
          "md:hidden",
          mode === "hidden" && "md:inline-flex"
        )}
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" showCloseButton={false} className="w-60 p-0 bg-sidebar flex flex-col">
          <SheetTitle className="sr-only">Navigation</SheetTitle>

          {/* Logo */}
          <Link href="/" className="flex h-14 items-center gap-2.5 px-4 hover:bg-accent/50 transition-colors">
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
          </Link>

          <Separator className="bg-sidebar-border" />

          {/* Campaign Switcher */}
          <div className="pt-2">
            <CampaignSwitcher activeCampaignId={activeCampaignId} />
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-0.5 px-3 py-3">
            {mainNavItems.map((item) => (
              <NavLink key={item.href} {...item} count={getCount(item.href)} />
            ))}
          </nav>

          {/* Bottom: Settings */}
          <div className="border-t border-sidebar-border px-3 py-3">
            <NavLink href="/settings" label="Settings" icon={Settings} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
