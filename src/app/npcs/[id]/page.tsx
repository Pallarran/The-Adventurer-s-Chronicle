import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getNpc } from "@/lib/actions/npcs";
import { PageHeaderSetter } from "@/components/layout/page-header-setter";
import { RichTextDisplay } from "@/components/shared/rich-text-display";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button-variants";
import {
  Pencil,
  User,
  Star,
  Shield,
  CalendarDays,
  ScrollText,
} from "lucide-react";
import { NpcDeleteButton } from "./delete-button";
import { ImageLightbox } from "@/components/shared/image-lightbox";
import { NPC_STATUS_COLORS, STANCE_COLORS, STANCE_LABELS } from "@/lib/colors";
import type { JSONContent } from "@tiptap/react";
import type { NpcStatus, AlignmentStance } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

export default async function NpcDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const npc = await getNpc(id);
  if (!npc) notFound();

  return (
    <div>
      <PageHeaderSetter
        title={npc.name}
        description={npc.aliasTitle ?? undefined}
        backHref="/npcs"
        backLabel="NPCs"
      />

      <div className="flex items-center gap-2 pb-4">
        <Link href={`/npcs/${npc.id}/edit`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </Link>
        <NpcDeleteButton id={npc.id} />
      </div>

      {/* Portrait */}
      {npc.mainImage && (
        <ImageLightbox src={`/api/upload/${npc.mainImage}`} alt={npc.name}>
          <div className="relative mb-6 w-48 aspect-[2/3] overflow-hidden rounded-lg border border-border bg-muted">
            <Image
              src={`/api/upload/${npc.mainImage}`}
              alt={npc.name}
              fill
              className="object-contain"
            />
          </div>
        </ImageLightbox>
      )}

      {/* Metadata — compact inline (matches form identity fields order) */}
      <div className="mb-6 flex items-center gap-4 text-sm text-muted-foreground">
        <Badge
          variant="outline"
          style={{
            borderColor: NPC_STATUS_COLORS[npc.status as NpcStatus],
            color: NPC_STATUS_COLORS[npc.status as NpcStatus],
          }}
        >
          {npc.status}
        </Badge>
        {!npc.partyMember && npc.alignmentStance !== "UNKNOWN" && (
          <Badge
            variant="outline"
            className="border-transparent"
            style={{
              backgroundColor: STANCE_COLORS[npc.alignmentStance as AlignmentStance] + "40",
              color: STANCE_COLORS[npc.alignmentStance as AlignmentStance],
            }}
          >
            {STANCE_LABELS[npc.alignmentStance as AlignmentStance]}
          </Badge>
        )}
        {npc.partyMember && (
          <span className="flex items-center gap-1 text-gold">
            <Star className="h-4 w-4 fill-gold" />
            Party Member
          </span>
        )}
        {npc.race && (
          <>
            <span className="text-border">·</span>
            <span>{npc.race}</span>
          </>
        )}
        {npc.gender && (
          <>
            <span className="text-border">·</span>
            <span>{npc.gender}</span>
          </>
        )}
        {npc.classRole && (
          <>
            <span className="text-border">·</span>
            <span>{npc.classRole}</span>
          </>
        )}
      </div>

      {/* Relations — bordered cards (matches form card order) */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-border p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <Shield className="h-4 w-4" /> Organization
          </div>
          {npc.organization ? (
            <div className="flex flex-wrap gap-1.5">
              <Link href={`/organizations/${npc.organization.id}`} className={cn(badgeVariants({variant: "secondary"}))}>
                {npc.organization.name}
              </Link>
            </div>
          ) : (
            <p className="text-sm italic text-muted-foreground/60">None</p>
          )}
        </div>
        <div className="rounded-lg border border-border p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <CalendarDays className="h-4 w-4" /> First Appearance
          </div>
          {npc.firstAppearanceSession ? (
            <div className="flex flex-wrap gap-1.5">
              <Link href={`/sessions/${npc.firstAppearanceSession.id}`} className={cn(badgeVariants({variant: "secondary"}))}>
                #{npc.firstAppearanceSession.sessionNumber}
                {npc.firstAppearanceSession.title && ` — ${npc.firstAppearanceSession.title}`}
              </Link>
            </div>
          ) : (
            <p className="text-sm italic text-muted-foreground/60">None</p>
          )}
        </div>
        <div className="rounded-lg border border-border p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <CalendarDays className="h-4 w-4" /> Last Appearance
          </div>
          {npc.lastAppearanceSession ? (
            <div className="flex flex-wrap gap-1.5">
              <Link href={`/sessions/${npc.lastAppearanceSession.id}`} className={cn(badgeVariants({variant: "secondary"}))}>
                #{npc.lastAppearanceSession.sessionNumber}
                {npc.lastAppearanceSession.title && ` — ${npc.lastAppearanceSession.title}`}
              </Link>
            </div>
          ) : (
            <p className="text-sm italic text-muted-foreground/60">None</p>
          )}
        </div>
      </div>

      {/* Featured Sessions (read-only, not in form) */}
      {npc.sessions && npc.sessions.length > 0 && (
        <div className="mb-6 rounded-lg border border-border p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <ScrollText className="h-4 w-4" /> Featured Sessions
          </div>
          <div className="flex flex-wrap gap-1.5">
            {npc.sessions.map((s) => (
              <Link key={s.session.id} href={`/sessions/${s.session.id}`} className={cn(badgeVariants({variant: "secondary"}))}>
                #{s.session.sessionNumber}
                {s.session.title && ` — ${s.session.title}`}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="mb-6">
        <h2 className="mb-3 text-lg font-semibold">Notes</h2>
        <div className="rounded-lg border border-border bg-card p-4">
          {npc.notesBody ? (
            <RichTextDisplay content={npc.notesBody as JSONContent} />
          ) : (
            <p className="text-sm italic text-muted-foreground/60">No notes yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
