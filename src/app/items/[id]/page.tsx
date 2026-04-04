import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getItem } from "@/lib/actions/items";
import { PageHeaderSetter } from "@/components/layout/page-header-setter";
import { RichTextDisplay } from "@/components/shared/rich-text-display";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button-variants";
import { Pencil, Package, Tag, Sparkles, Lock, BadgeDollarSign, ScrollText } from "lucide-react";
import { ItemDeleteButton } from "./delete-button";
import { ImageLightbox } from "@/components/shared/image-lightbox";
import { RARITY_COLORS } from "@/lib/colors";
import type { JSONContent } from "@tiptap/react";

export const dynamic = "force-dynamic";

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getItem(id);
  if (!item) notFound();

  return (
    <div>
      <PageHeaderSetter title={item.name} backHref="/items" backLabel="Items" />

      <div className="flex items-center gap-2 pb-4">
        <Link href={`/items/${item.id}/edit`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </Link>
        <ItemDeleteButton id={item.id} />
      </div>

      {/* Identity — image left, metadata right (matches form layout) */}
      <div className="mb-6 flex flex-col gap-6 sm:flex-row">
        <div className="w-full sm:w-48 sm:shrink-0">
          {item.mainImage ? (
            <ImageLightbox src={`/api/upload/${item.mainImage}`} alt={item.name}>
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-border bg-muted">
                <Image
                  src={`/api/upload/${item.mainImage}`}
                  alt={item.name}
                  fill
                  className="object-contain"
                />
              </div>
            </ImageLightbox>
          ) : (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-border bg-muted">
              <div className="flex h-full w-full items-center justify-center">
                <Package className="h-12 w-12 text-muted-foreground/30" />
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {item.type && (
              <Badge variant="outline">{item.type}</Badge>
            )}
            {item.rarity && (
              <Badge variant="outline" className={RARITY_COLORS[item.rarity] ?? ""}>
                {item.rarity}
              </Badge>
            )}
            {item.attunement && (
              <Badge variant="outline" className="gap-1">
                <Lock className="h-3 w-3" />
                Requires Attunement
              </Badge>
            )}
            {item.sold && (
              <Badge variant="outline" className="gap-1 border-muted-foreground/30 bg-muted-foreground/10 text-muted-foreground">
                <BadgeDollarSign className="h-3 w-3" />
                Sold
              </Badge>
            )}
          </div>
          {item.aura && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              {item.aura}
            </div>
          )}
          {item.acquiredInSession && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <ScrollText className="h-3.5 w-3.5 text-arcane-teal" />
              Acquired in{" "}
              <Link href={`/sessions/${item.acquiredInSession.id}`} className={cn(badgeVariants({ variant: "secondary" }))}>
                #{item.acquiredInSession.sessionNumber}
                {item.acquiredInSession.title && ` — ${item.acquiredInSession.title}`}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Tags */}
      {item.tags.length > 0 && (
        <div className="mb-6 rounded-lg border border-border p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <Tag className="h-4 w-4" /> Tags
          </div>
          <div className="flex flex-wrap gap-1.5">
            {item.tags.map((t) => (
              <Badge key={t.tag.id} variant="outline">
                {t.tag.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="mb-6">
        <h2 className="mb-3 text-lg font-semibold">Description &amp; Effects</h2>
        <div className="rounded-lg border border-border bg-card p-4">
          {item.notesBody ? (
            <RichTextDisplay content={item.notesBody as JSONContent} />
          ) : (
            <p className="text-sm italic text-muted-foreground/60">No description yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
