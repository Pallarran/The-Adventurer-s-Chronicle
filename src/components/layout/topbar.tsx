"use client";

import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Topbar() {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-sm">
      <div className="flex-1" />

      <div className="flex items-center gap-2">
        {/* Global search — placeholder for Phase 4 */}
        <Button
          variant="outline"
          size="sm"
          className="hidden gap-2 text-muted-foreground sm:flex"
          disabled
        >
          <Search className="h-4 w-4" />
          <span className="text-xs">Search...</span>
          <kbd className="pointer-events-none ml-2 inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            Ctrl+K
          </kbd>
        </Button>

        {/* Quick create — placeholder for Phase 4 */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 text-muted-foreground"
          disabled
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
