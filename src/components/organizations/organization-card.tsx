import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
      <Card className="transition-colors hover:border-gold/30 hover:bg-card/80">
        <CardHeader className="pb-2">
          <div className="flex items-start gap-3">
            {organization.mainImage ? (
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-border">
                <Image
                  src={`/api/upload/${organization.mainImage}`}
                  alt={organization.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-muted/50">
                <Shield className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium text-foreground">
                  {organization.name}
                </span>
              </div>
              {organization.type && (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {organization.type}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge
              variant="outline"
              className="border-transparent text-xs"
              style={{
                backgroundColor: `${stanceColor}20`,
                color: stanceColor,
              }}
            >
              {STANCE_LABELS[organization.alignmentStance]}
            </Badge>
            {organization.npcs.length > 0 && (
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {organization.npcs.length} member
                {organization.npcs.length !== 1 && "s"}
              </span>
            )}
          </div>
          {organization.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {organization.tags.map((t) => (
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
