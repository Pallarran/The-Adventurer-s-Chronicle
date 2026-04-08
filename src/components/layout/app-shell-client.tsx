"use client";

import type { ReactNode } from "react";
import { Topbar } from "./topbar";
import { useSidebarMode } from "./sidebar-mode-context";
import { cn } from "@/lib/utils";

interface AppShellClientProps {
  campaignId: string | null;
  children: ReactNode;
}

export function AppShellClient({ campaignId, children }: AppShellClientProps) {
  const { mode } = useSidebarMode();

  const paddingClass =
    mode === "full" ? "md:pl-60" : mode === "icon" ? "md:pl-16" : "md:pl-0";

  return (
    <div
      className={cn(
        "transition-[padding] duration-200 ease-out",
        paddingClass
      )}
    >
      <Topbar activeCampaignId={campaignId} />
      <main className="animate-in fade-in-0 duration-200 p-4 sm:p-6">
        {children}
      </main>
    </div>
  );
}
