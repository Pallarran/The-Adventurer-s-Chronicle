"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ImageWithCrop } from "@/components/shared/image-crop-button";
import { updateItemImagePosition, updateItem } from "@/lib/actions/items";
import { RARITY_COLORS } from "@/lib/colors";
import { Package, BadgeDollarSign, PackageOpen } from "lucide-react";
import type { ItemListItem } from "@/types";

interface ItemCardProps {
  item: ItemListItem;
}

export function ItemCard({ item }: ItemCardProps) {
  const [sold, setSold] = useState(item.sold);
  const [isPending, startTransition] = useTransition();

  const toggleSold = () => {
    const newSold = !sold;
    const prev = sold;
    setSold(newSold);
    startTransition(async () => {
      try {
        await updateItem(item.id, { sold: newSold });
      } catch {
        setSold(prev);
      }
    });
  };

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

          {/* Sold toggle button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleSold();
            }}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 text-muted-foreground backdrop-blur-sm transition-colors hover:bg-background hover:text-foreground"
            title={sold ? "Move to inventory" : "Mark as sold"}
            style={{ opacity: isPending ? 0.5 : 1 }}
          >
            {sold ? (
              <PackageOpen className="h-3.5 w-3.5" />
            ) : (
              <BadgeDollarSign className="h-3.5 w-3.5" />
            )}
          </button>
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
