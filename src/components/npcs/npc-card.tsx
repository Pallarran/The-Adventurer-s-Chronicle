import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
      <Card className="h-full overflow-hidden transition-colors hover:border-gold/30 hover:bg-card/80 hover:shadow-lg hover:shadow-gold/10">
        {/* Portrait */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          {npc.mainImage ? (
            <Image
              src={`/api/upload/${npc.mainImage}`}
              alt={npc.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <User className="h-10 w-10 text-muted-foreground/40" />
            </div>
          )}
          <Badge
            variant="outline"
            className="absolute bottom-2 left-2 text-xs backdrop-blur-sm bg-background/70"
            style={{
              borderColor: STATUS_COLORS[npc.status],
              color: STATUS_COLORS[npc.status],
            }}
          >
            {npc.status}
          </Badge>
          {npc.partyMember && (
            <Star className="absolute top-2 right-2 h-4 w-4 fill-gold text-gold drop-shadow" />
          )}
        </div>

        {/* Info — fixed height for consistency */}
        <div className="flex min-h-[5.5rem] flex-col justify-between p-3">
          <div className="space-y-0.5">
            <p className="truncate text-sm font-bold">{npc.name}</p>
            <p className="truncate text-xs text-muted-foreground italic">
              {npc.aliasTitle || "\u00A0"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {[npc.race, npc.classRole].filter(Boolean).join(" · ") || "\u00A0"}
            </p>
          </div>

          <div className="mt-1.5 flex items-center justify-between gap-2">
            {npc.organization ? (
              <span className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
                <Shield className="h-3 w-3 shrink-0" />
                <span className="truncate">{npc.organization.name}</span>
              </span>
            ) : (
              <span />
            )}
            {npc.tags.length > 0 && (
              <div className="flex shrink-0 gap-1">
                {npc.tags.slice(0, 2).map((t) => (
                  <Badge key={t.tag.id} variant="outline" className="text-xs px-1.5 py-0">
                    {t.tag.name}
                  </Badge>
                ))}
                {npc.tags.length > 2 && (
                  <span className="text-xs text-muted-foreground">+{npc.tags.length - 2}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
