import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getNpc } from "@/lib/actions/npcs";
import { PageHeader } from "@/components/shared/page-header";
import { RichTextDisplay } from "@/components/shared/rich-text-display";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Pencil,
  User,
  Star,
  Shield,
  ScrollText,
  Tag,
} from "lucide-react";
import { NpcDeleteButton } from "./delete-button";
import type { JSONContent } from "@tiptap/react";
import type { NpcStatus } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<NpcStatus, string> = {
  ALIVE: "#4a9a5a",
  DEAD: "#9a4a4a",
  MISSING: "#9a8a4a",
  UNKNOWN: "#6a6a7a",
};

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
      <PageHeader
        title={npc.name}
        description={npc.aliasTitle ?? undefined}
      >
        <Link href={`/npcs/${npc.id}/edit`} className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
            <Pencil className="mr-2 h-4 w-4" />
            Edit
        </Link>
        <NpcDeleteButton id={npc.id} />
      </PageHeader>

      {/* Hero Section */}
      <div className="mb-6 flex flex-col gap-6 sm:flex-row">
        {/* Portrait */}
        <div className="relative h-48 w-48 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
          {npc.mainImage ? (
            <Image
              src={`/api/upload/${npc.mainImage}`}
              alt={npc.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <User className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="flex-1 rounded-lg border border-border bg-card p-4">
          <div className="mb-4 flex items-center gap-3">
            <Badge
              variant="outline"
              className="text-sm"
              style={{
                borderColor: STATUS_COLORS[npc.status as NpcStatus],
                color: STATUS_COLORS[npc.status as NpcStatus],
              }}
            >
              {npc.status}
            </Badge>
            {npc.partyMember && (
              <span className="flex items-center gap-1 text-sm text-gold">
                <Star className="h-4 w-4 fill-gold" />
                Party Member
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {npc.gender && (
              <div>
                <span className="text-xs font-medium text-muted-foreground">Gender</span>
                <p className="mt-1 text-sm">{npc.gender}</p>
              </div>
            )}
            {npc.classRole && (
              <div>
                <span className="text-xs font-medium text-muted-foreground">Class / Role</span>
                <p className="mt-1 text-sm">{npc.classRole}</p>
              </div>
            )}
            {npc.organization && (
              <div>
                <span className="text-xs font-medium text-muted-foreground">Organization</span>
                <div className="mt-1">
                  <Link href={`/organizations/${npc.organization.id}`} className={cn(badgeVariants({variant: "secondary"}))}>
                      <Shield className="mr-1 h-3 w-3" />
                      {npc.organization.name}
                  </Link>
                </div>
              </div>
            )}
            {npc.firstAppearanceSession && (
              <div>
                <span className="text-xs font-medium text-muted-foreground">First Appearance</span>
                <div className="mt-1">
                  <Link href={`/sessions/${npc.firstAppearanceSession.id}`} className={cn(badgeVariants({variant: "secondary"}))}>
                      <ScrollText className="mr-1 h-3 w-3" />
                      Session #{npc.firstAppearanceSession.sessionNumber}
                      {npc.firstAppearanceSession.title && ` — ${npc.firstAppearanceSession.title}`}
                  </Link>
                </div>
              </div>
            )}
            {npc.lastAppearanceSession && (
              <div>
                <span className="text-xs font-medium text-muted-foreground">Last Appearance</span>
                <div className="mt-1">
                  <Link href={`/sessions/${npc.lastAppearanceSession.id}`} className={cn(badgeVariants({variant: "secondary"}))}>
                      <ScrollText className="mr-1 h-3 w-3" />
                      Session #{npc.lastAppearanceSession.sessionNumber}
                      {npc.lastAppearanceSession.title && ` — ${npc.lastAppearanceSession.title}`}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sessions this NPC appeared in */}
      {npc.sessions && npc.sessions.length > 0 && (
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <ScrollText className="h-3.5 w-3.5" /> Featured Sessions
          </div>
          <div className="flex flex-wrap gap-1.5">
            {npc.sessions.map((s) => (
              <Link key={s.session.id} href={`/sessions/${s.session.id}`} className={cn(badgeVariants({variant: "secondary"}))}>
                  Session #{s.session.sessionNumber}
                  {s.session.title && ` — ${s.session.title}`}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {npc.tags.length > 0 && (
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Tag className="h-3.5 w-3.5" /> Tags
          </div>
          <div className="flex flex-wrap gap-1.5">
            {npc.tags.map((t) => (
              <Badge key={t.tag.id} variant="outline">
                {t.tag.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {npc.notesBody && (
        <div className="mb-6">
          <h2 className="mb-3 text-lg font-semibold">Notes</h2>
          <div className="rounded-lg border border-border bg-card p-4">
            <RichTextDisplay content={npc.notesBody as JSONContent} />
          </div>
        </div>
      )}
    </div>
  );
}
