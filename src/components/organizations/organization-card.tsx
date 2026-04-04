import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ImageWithCrop } from "@/components/shared/image-crop-button";
import { updateOrganizationImagePosition } from "@/lib/actions/organizations";
import { Shield, Users } from "lucide-react";
import { STANCE_COLORS, STANCE_LABELS } from "@/lib/colors";
import type { OrganizationListItem } from "@/types";

interface OrganizationCardProps {
  organization: OrganizationListItem;
}

export function OrganizationCard({ organization }: OrganizationCardProps) {
  const stanceColor = STANCE_COLORS[organization.alignmentStance];

  return (
    <Link href={`/organizations/${organization.id}`}>
      <Card className="h-full overflow-hidden transition-colors hover:border-gem-jade/30 hover:bg-card/80 hover:shadow-lg hover:shadow-gem-jade/10">
        {/* Image */}
        <div className="group/image relative aspect-square w-full overflow-hidden bg-muted">
          {organization.mainImage ? (
            <ImageWithCrop
              src={`/api/upload/${organization.mainImage}`}
              alt={organization.name}
              entityId={organization.id}
              positionY={organization.imagePositionY}
              onSave={updateOrganizationImagePosition}
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
        <div className="flex flex-col justify-between px-2 py-1">
          <div>
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

        </div>
      </Card>
    </Link>
  );
}
