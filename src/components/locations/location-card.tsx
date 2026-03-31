import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import type { LocationListItem } from "@/types";

interface LocationCardProps {
  location: LocationListItem;
}

export function LocationCard({ location }: LocationCardProps) {
  return (
    <Link href={`/locations/${location.id}`}>
      <Card className="overflow-hidden transition-colors hover:border-gold/30 hover:bg-card/80">
        <div className="relative aspect-video w-full bg-muted">
          {location.mainImage ? (
            <Image
              src={`/api/upload/${location.mainImage}`}
              alt={location.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <MapPin className="h-10 w-10 text-muted-foreground/40" />
            </div>
          )}
        </div>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <span className="text-sm font-semibold text-foreground line-clamp-1">
              {location.name}
            </span>
            {location.type && (
              <Badge variant="outline" className="shrink-0 text-xs">
                {location.type}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {location.parentLocation && (
            <p className="mb-2 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {location.parentLocation.name}
            </p>
          )}
          {location.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {location.tags.map((t) => (
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
