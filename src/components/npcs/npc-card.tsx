import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { User, Star, Shield } from "lucide-react";
import type { NpcStatus } from "@/generated/prisma/client";
import type { NpcListItem } from "@/types";

const STATUS_COLORS: Record<NpcStatus, string> = {
  ALIVE: "#4a9a5a",
  DEAD: "#9a4a4a",
  MISSING: "#9a8a4a",
  UNKNOWN: "#6a6a7a",
};

interface NpcCardProps {
  npc: NpcListItem;
}

export function NpcCard({ npc }: NpcCardProps) {
  return (
    <Link href={`/npcs/${npc.id}`}>
      <Card className="transition-colors hover:border-gold/30 hover:bg-card/80">
        <CardHeader className="pb-2">
          <div className="flex items-start gap-3">
            {/* Portrait thumbnail */}
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
              {npc.mainImage ? (
                <Image
                  src={`/api/upload/${npc.mainImage}`}
                  alt={npc.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <User className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-bold text-foreground">
                  {npc.name}
                </span>
                {npc.partyMember && (
                  <Star className="h-3.5 w-3.5 shrink-0 fill-gold text-gold" />
                )}
              </div>
              {npc.aliasTitle && (
                <p className="truncate text-xs text-muted-foreground italic">
                  {npc.aliasTitle}
                </p>
              )}
              <div className="mt-1 flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-xs"
                  style={{
                    borderColor: STATUS_COLORS[npc.status],
                    color: STATUS_COLORS[npc.status],
                  }}
                >
                  {npc.status}
                </Badge>
                {npc.classRole && (
                  <span className="truncate text-xs text-muted-foreground">
                    {npc.classRole}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {npc.organization && (
              <span className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                {npc.organization.name}
              </span>
            )}
          </div>
          {npc.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {npc.tags.map((t) => (
                <Badge key={t.tag.id} variant="outline" className="text-xs">
                  {t.tag.name}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
