import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Shield, Users } from "lucide-react";
import type { AlignmentStance } from "@/generated/prisma/client";
import type { OrganizationListItem } from "@/types";

const STANCE_COLORS: Record<AlignmentStance, string> = {
  ALLIED: "#4a9a5a",
  FRIENDLY: "#5a9a8a",
  NEUTRAL: "#6a6a7a",
  SUSPICIOUS: "#9a8a4a",
  HOSTILE: "#9a4a4a",
  UNKNOWN: "#5a5a6a",
};

const STANCE_LABELS: Record<AlignmentStance, string> = {
  ALLIED: "Allied",
  FRIENDLY: "Friendly",
  NEUTRAL: "Neutral",
  SUSPICIOUS: "Suspicious",
  HOSTILE: "Hostile",
  UNKNOWN: "Unknown",
};

interface OrganizationCardProps {
  organization: OrganizationListItem;
}

export function OrganizationCard({ organization }: OrganizationCardProps) {
  const stanceColor = STANCE_COLORS[organization.alignmentStance];

  return (
    <Link href={`/organizations/${organization.id}`}>
      <Card className="h-full overflow-hidden transition-colors hover:border-gold/30 hover:bg-card/80 hover:shadow-lg hover:shadow-gold/10">
        {/* Image */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          {organization.mainImage ? (
            <Image
              src={`/api/upload/${organization.mainImage}`}
              alt={organization.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Shield className="h-10 w-10 text-muted-foreground/40" />
            </div>
          )}
          <Badge
            variant="outline"
            className="absolute bottom-2 left-2 text-xs backdrop-blur-sm bg-background/70 border-transparent"
            style={{
              backgroundColor: `${stanceColor}40`,
              color: stanceColor,
            }}
          >
            {STANCE_LABELS[organization.alignmentStance]}
          </Badge>
        </div>

        {/* Info — fixed height for consistency */}
        <div className="flex min-h-[5.5rem] flex-col justify-between p-3">
          <div className="space-y-0.5">
            <p className="truncate text-sm font-bold">{organization.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {organization.type || "\u00A0"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {organization.npcs.length > 0 ? (
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {organization.npcs.length} member{organization.npcs.length !== 1 && "s"}
                </span>
              ) : (
                "\u00A0"
              )}
            </p>
          </div>

          {organization.tags.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {organization.tags.slice(0, 2).map((t) => (
                <Badge key={t.tag.id} variant="outline" className="text-xs px-1.5 py-0">
                  {t.tag.name}
                </Badge>
              ))}
              {organization.tags.length > 2 && (
                <span className="text-xs text-muted-foreground">+{organization.tags.length - 2}</span>
              )}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
