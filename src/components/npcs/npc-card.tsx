import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ImageWithCrop } from "@/components/shared/image-crop-button";
import { updateNpcImagePosition } from "@/lib/actions/npcs";
import { User, Star, Shield } from "lucide-react";
import { NPC_STATUS_COLORS, STANCE_COLORS, STANCE_LABELS } from "@/lib/colors";
import type { NpcListItem } from "@/types";

interface NpcCardProps {
  npc: NpcListItem;
}

export function NpcCard({ npc }: NpcCardProps) {
  return (
    <Link href={`/npcs/${npc.id}`}>
      <Card className="h-full overflow-hidden transition-colors hover:border-gem-jade/30 hover:bg-card/80 hover:shadow-lg hover:shadow-gem-jade/10">
        {/* Portrait */}
        <div className="group/image relative aspect-square w-full overflow-hidden bg-muted">
          {npc.mainImage ? (
            <ImageWithCrop
              src={`/api/upload/${npc.mainImage}`}
              alt={npc.name}
              entityId={npc.id}
              positionY={npc.imagePositionY}
              onSave={updateNpcImagePosition}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <User className="h-10 w-10 text-muted-foreground/40" />
            </div>
          )}
          <div className="absolute bottom-2 left-2 flex gap-1">
            <Badge
              variant="outline"
              className="text-xs backdrop-blur-sm bg-background/70"
              style={{
                borderColor: NPC_STATUS_COLORS[npc.status],
                color: NPC_STATUS_COLORS[npc.status],
              }}
            >
              {npc.status}
            </Badge>
            {!npc.partyMember && npc.alignmentStance !== "UNKNOWN" && (
              <Badge
                variant="outline"
                className="border-transparent text-xs backdrop-blur-sm"
                style={{
                  backgroundColor: STANCE_COLORS[npc.alignmentStance] + "40",
                  color: STANCE_COLORS[npc.alignmentStance],
                }}
              >
                {STANCE_LABELS[npc.alignmentStance]}
              </Badge>
            )}
          </div>
          {npc.partyMember && (
            <Star className="absolute top-2 right-2 h-4 w-4 fill-gold text-gold drop-shadow" />
          )}
        </div>

        {/* Info — fixed height for consistency */}
        <div className="flex flex-col justify-between px-2 py-1">
          <div>
            <p className="truncate text-sm font-bold">{npc.name}</p>
            <p className="truncate text-xs text-muted-foreground italic">
              {npc.aliasTitle || "\u00A0"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {[npc.race, npc.classRole].filter(Boolean).join(" · ") || "\u00A0"}
            </p>
          </div>

          {npc.organization && (
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Shield className="h-3 w-3 shrink-0" />
              <span className="truncate">{npc.organization.name}</span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
