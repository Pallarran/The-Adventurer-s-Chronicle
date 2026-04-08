"use client";

import { useContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { FormGuardContext } from "./form-guard-provider";
import type { LucideIcon } from "lucide-react";

interface NavLinkProps {
  href: string;
  label: string;
  icon: LucideIcon;
  count?: number;
  collapsed?: boolean;
}

export function NavLink({
  href,
  label,
  icon: Icon,
  count,
  collapsed = false,
}: NavLinkProps) {
  const pathname = usePathname();
  const { requestNavigation } = useContext(FormGuardContext);
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!requestNavigation(href)) {
      e.preventDefault();
    }
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      title={collapsed ? label : undefined}
      className={cn(
        "group relative flex items-center rounded-md py-2 text-sm font-medium transition-all duration-200",
        collapsed ? "justify-center px-2" : "gap-3 px-3",
        isActive
          ? "bg-gold/10 text-gold"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      )}
    >
      {/* Active indicator bar */}
      {isActive && (
        <span className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-gold" />
      )}
      <Icon
        className={cn(
          "h-4 w-4 shrink-0 transition-colors",
          isActive ? "text-gold" : "group-hover:text-foreground"
        )}
      />
      {!collapsed && (
        <>
          <span>{label}</span>
          {count !== undefined && (
            <span
              className={cn(
                "ml-auto text-[11px] tabular-nums",
                isActive ? "text-gold/60" : "text-muted-foreground/50"
              )}
            >
              {count}
            </span>
          )}
        </>
      )}
    </Link>
  );
}
