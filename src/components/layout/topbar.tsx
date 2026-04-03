"use client";

import { useCallback, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { Search, ArrowLeft } from "lucide-react";
import { FormGuardContext } from "./form-guard-provider";
import { Button } from "@/components/ui/button";
import { GlobalSearch } from "@/components/search/global-search";
import { QuickCreate } from "@/components/search/quick-create";
import { MobileSidebar } from "./mobile-sidebar";
import { usePageHeader } from "./page-header-context";

export function Topbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const { header } = usePageHeader();
  const { requestNavigation } = useContext(FormGuardContext);

  // Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const openSearch = useCallback(() => setSearchOpen(true), []);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between bg-background/80 px-4 sm:px-6 backdrop-blur-sm">
      {/* Left: hamburger + back + title + description */}
      <div className="flex min-w-0 items-center gap-2">
        <MobileSidebar />

        {header?.backHref && (
          <Link
            href={header.backHref}
            onClick={(e) => {
              if (!requestNavigation(header.backHref!)) e.preventDefault();
            }}
            className="flex shrink-0 items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            title={header.backLabel ?? "Back"}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{header.backLabel ?? "Back"}</span>
          </Link>
        )}

        {header?.title && (
          <div className="flex min-w-0 items-baseline gap-2">
            <h1 className="truncate text-lg font-bold tracking-tight text-foreground">
              {header.title}
            </h1>
            {header.description && (
              <span className="hidden shrink-0 text-sm text-muted-foreground sm:inline">
                — {header.description}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Right: search + quick create */}
      <div className="flex shrink-0 items-center gap-2">
        {/* Mobile search (icon only) */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="sm:hidden text-muted-foreground"
          onClick={openSearch}
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </Button>

        {/* Desktop search trigger */}
        <Button
          variant="outline"
          size="sm"
          className="hidden gap-2 text-muted-foreground sm:flex"
          onClick={openSearch}
        >
          <Search className="h-4 w-4" />
          <span className="text-xs">Search...</span>
          <kbd className="pointer-events-none ml-2 inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            Ctrl+K
          </kbd>
        </Button>

        {/* Quick create dropdown */}
        <QuickCreate />

        {/* Global search dialog */}
        <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
      </div>

      {/* Gold accent separator */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold via-gold/40 to-transparent" />
    </header>
  );
}
