import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ImageWithCrop } from "@/components/shared/image-crop-button";
import { updateItemImagePosition } from "@/lib/actions/items";
import { RARITY_COLORS } from "@/lib/colors";
import { Package } from "lucide-react";
import type { ItemListItem } from "@/types";

interface ItemCardProps {
  item: ItemListItem;
}

export function ItemCard({ item }: ItemCardProps) {
  return (
    <Link href={`/items/${item.id}`}>
      <Card className="h-full overflow-hidden transition-colors hover:border-gem-jade/30 hover:bg-card/80 hover:shadow-lg hover:shadow-gem-jade/10">
        {/* Image */}
        <div className="group/image relative aspect-square w-full overflow-hidden bg-muted">
          {item.mainImage ? (
            <ImageWithCrop
              src={`/api/upload/${item.mainImage}`}
              alt={item.name}
              entityId={item.id}
              positionY={item.imagePositionY}
              onSave={updateItemImagePosition}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package className="h-10 w-10 text-muted-foreground/40" />
            </div>
          )}
          {item.rarity && (
            <Badge
              variant="outline"
              className={`absolute bottom-2 left-2 text-xs backdrop-blur-sm ${RARITY_COLORS[item.rarity] ?? "bg-background/70"}`}
            >
              {item.rarity}
            </Badge>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col justify-between px-2 py-1">
          <div>
            <p className="truncate text-sm font-bold">{item.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {item.type ?? "\u00A0"}
            </p>
          </div>

          {item.tags.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {item.tags.slice(0, 2).map((t) => (
                <Badge key={t.tag.id} variant="outline" className="text-xs px-1.5 py-0">
                  {t.tag.name}
                </Badge>
              ))}
              {item.tags.length > 2 && (
                <span className="text-xs text-muted-foreground">+{item.tags.length - 2}</span>
              )}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
