import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ImageWithCrop } from "@/components/shared/image-crop-button";
import { updateLocationImagePosition } from "@/lib/actions/locations";
import { MapPin } from "lucide-react";
import type { LocationListItem } from "@/types";

interface LocationCardProps {
  location: LocationListItem;
}

export function LocationCard({ location }: LocationCardProps) {
  return (
    <Link href={`/locations/${location.id}`}>
      <Card className="h-full overflow-hidden transition-colors hover:border-gem-jade/30 hover:bg-card/80 hover:shadow-lg hover:shadow-gem-jade/10">
        {/* Image */}
        <div className="group/image relative aspect-square w-full overflow-hidden bg-muted">
          {location.mainImage ? (
            <ImageWithCrop
              src={`/api/upload/${location.mainImage}`}
              alt={location.name}
              entityId={location.id}
              positionY={location.imagePositionY}
              onSave={updateLocationImagePosition}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <MapPin className="h-10 w-10 text-muted-foreground/40" />
            </div>
          )}
          {location.type && (
            <Badge
              variant="outline"
              className="absolute bottom-2 left-2 text-xs backdrop-blur-sm bg-background/70"
            >
              {location.type}
            </Badge>
          )}
        </div>

        {/* Info — fixed height for consistency */}
        <div className="flex flex-col justify-between px-2 py-1">
          <div>
            <p className="truncate text-sm font-bold">{location.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {location.parentLocation ? (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {location.parentLocation.name}
                </span>
              ) : (
                "\u00A0"
              )}
            </p>
          </div>

          {location.tags.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {location.tags.slice(0, 2).map((t) => (
                <Badge key={t.tag.id} variant="outline" className="text-xs px-1.5 py-0">
                  {t.tag.name}
                </Badge>
              ))}
              {location.tags.length > 2 && (
                <span className="text-xs text-muted-foreground">+{location.tags.length - 2}</span>
              )}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
