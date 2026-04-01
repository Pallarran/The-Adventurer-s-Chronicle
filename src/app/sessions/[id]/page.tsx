import { notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/actions/sessions";
import { PageHeaderSetter } from "@/components/layout/page-header-setter";
import { RichTextDisplay } from "@/components/shared/rich-text-display";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button-variants";
import { Pencil, CalendarDays, ScrollText, Users, MapPin, Shield, Tag } from "lucide-react";
import { SessionDeleteButton } from "./delete-button";
import type { JSONContent } from "@tiptap/react";

export const dynamic = "force-dynamic";

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession(id);
  if (!session) notFound();

  return (
    <div>
      <PageHeaderSetter
        title={`Session #${session.sessionNumber}${session.title ? ` — ${session.title}` : ""}`}
        backHref="/sessions"
        backLabel="Sessions"
      />

      <div className="flex items-center gap-2 pb-4">
        <Link href={`/sessions/${session.id}/edit`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </Link>
        <SessionDeleteButton id={session.id} />
      </div>

      {/* Metadata — compact inline */}
      <div className="mb-6 flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5 text-gold" />
          Played {new Date(session.realDatePlayed).toLocaleDateString()}
        </span>
        {session.inGameDate && (
          <>
            <span className="text-border">·</span>
            <span className="flex items-center gap-1.5">
              <ScrollText className="h-3.5 w-3.5 text-arcane-teal" />
              In-game: {session.inGameDate}
            </span>
          </>
        )}
      </div>

      {/* Relations + Tags */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <Users className="h-4 w-4" /> Featured NPCs
          </div>
          {session.npcs.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {session.npcs.map((n) => (
                <Link key={n.npc.id} href={`/npcs/${n.npc.id}`} className={cn(badgeVariants({variant: "secondary"}))}>{n.npc.name}</Link>
              ))}
            </div>
          ) : (
            <p className="text-sm italic text-muted-foreground/60">None</p>
          )}
        </div>
        <div className="rounded-lg border border-border p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <MapPin className="h-4 w-4" /> Featured Locations
          </div>
          {session.locations.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {session.locations.map((l) => (
                <Link key={l.location.id} href={`/locations/${l.location.id}`} className={cn(badgeVariants({variant: "secondary"}))}>{l.location.name}</Link>
              ))}
            </div>
          ) : (
            <p className="text-sm italic text-muted-foreground/60">None</p>
          )}
        </div>
        <div className="rounded-lg border border-border p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <Shield className="h-4 w-4" /> Featured Organizations
          </div>
          {session.organizations.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {session.organizations.map((o) => (
                <Link key={o.organization.id} href={`/organizations/${o.organization.id}`} className={cn(badgeVariants({variant: "secondary"}))}>{o.organization.name}</Link>
              ))}
            </div>
          ) : (
            <p className="text-sm italic text-muted-foreground/60">None</p>
          )}
        </div>
        <div className="rounded-lg border border-border p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <Tag className="h-4 w-4" /> Tags
          </div>
          {session.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {session.tags.map((t) => (
                <Badge key={t.tag.id} variant="outline">
                  {t.tag.name}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm italic text-muted-foreground/60">None</p>
          )}
        </div>
      </div>

      {/* Session Notes */}
      <div className="mb-6">
        <h2 className="mb-3 text-lg font-semibold">Session Notes</h2>
        <div className="rounded-lg border border-border bg-card p-4">
          {session.notesBody ? (
            <RichTextDisplay content={session.notesBody as JSONContent} />
          ) : (
            <p className="text-sm italic text-muted-foreground/60">No notes yet.</p>
          )}
        </div>
      </div>

      {/* Follow-up Actions */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Follow-Up Actions</h2>
        <div className="rounded-lg border border-border bg-card p-4">
          {session.followUpActions ? (
            <RichTextDisplay content={session.followUpActions as JSONContent} />
          ) : (
            <p className="text-sm italic text-muted-foreground/60">No follow-up actions.</p>
          )}
        </div>
      </div>
    </div>
  );
}
