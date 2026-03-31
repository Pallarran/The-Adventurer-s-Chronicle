"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface NavLinkProps {
  href: string;
  label: string;
  icon: LucideIcon;
}

export function NavLink({ href, label, icon: Icon }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-accent text-gold border-l-2 border-gold"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      )}
    >
      <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-gold")} />
      <span>{label}</span>
    </Link>
  );
}
