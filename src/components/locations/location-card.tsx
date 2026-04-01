import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import type { LocationListItem } from "@/types";

interface LocationCardProps {
  location: LocationListItem;
}

export function LocationCard({ location }: LocationCardProps) {
  return (
    <Link href={`/locations/${location.id}`}>
      <Card className="h-full overflow-hidden transition-colors hover:border-gold/30 hover:bg-card/80 hover:shadow-lg hover:shadow-gold/10">
        {/* Image */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          {location.mainImage ? (
            <Image
              src={`/api/upload/${location.mainImage}`}
              alt={location.name}
              fill
              className="object-cover"
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
        <div className="flex min-h-[4.5rem] flex-col justify-between p-3">
          <div className="space-y-0.5">
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
            <div className="mt-1.5 flex flex-wrap gap-1">
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
