import { notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/actions/sessions";
import { PageHeader } from "@/components/shared/page-header";
import { RichTextDisplay } from "@/components/shared/rich-text-display";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Pencil, CalendarDays, Users, MapPin, Shield } from "lucide-react";
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
      <PageHeader
        title={`Session #${session.sessionNumber}${session.title ? ` — ${session.title}` : ""}`}
      >
        <Link href={`/sessions/${session.id}/edit`} className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
            <Pencil className="mr-2 h-4 w-4" />
            Edit
        </Link>
        <SessionDeleteButton id={session.id} />
      </PageHeader>

      {/* Metadata */}
      <div className="mb-6 grid grid-cols-1 gap-4 rounded-lg border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <span className="text-xs font-medium text-muted-foreground">Date Played</span>
          <div className="mt-1 flex items-center gap-1.5 text-sm">
            <CalendarDays className="h-3.5 w-3.5 text-gold" />
            {new Date(session.realDatePlayed).toLocaleDateString()}
          </div>
        </div>
        {session.inGameDate && (
          <div>
            <span className="text-xs font-medium text-muted-foreground">In-Game Date</span>
            <p className="mt-1 text-sm text-arcane-teal">{session.inGameDate}</p>
          </div>
        )}
      </div>

      {/* Relations */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {session.npcs.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Users className="h-3.5 w-3.5" /> Featured NPCs
            </div>
            <div className="flex flex-wrap gap-1.5">
              {session.npcs.map((n) => (
                <Link key={n.npc.id} href={`/npcs/${n.npc.id}`} className={cn(badgeVariants({variant: "secondary"}))}>{n.npc.name}</Link>
              ))}
            </div>
          </div>
        )}
        {session.locations.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" /> Featured Locations
            </div>
            <div className="flex flex-wrap gap-1.5">
              {session.locations.map((l) => (
                <Link key={l.location.id} href={`/locations/${l.location.id}`} className={cn(badgeVariants({variant: "secondary"}))}>{l.location.name}</Link>
              ))}
            </div>
          </div>
        )}
        {session.organizations.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Shield className="h-3.5 w-3.5" /> Featured Organizations
            </div>
            <div className="flex flex-wrap gap-1.5">
              {session.organizations.map((o) => (
                <Link key={o.organization.id} href={`/organizations/${o.organization.id}`} className={cn(badgeVariants({variant: "secondary"}))}>{o.organization.name}</Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tags */}
      {session.tags.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-1.5">
          {session.tags.map((t) => (
            <Badge key={t.tag.id} variant="outline">
              {t.tag.name}
            </Badge>
          ))}
        </div>
      )}

      {/* Session Notes */}
      <div className="mb-6">
        <h2 className="mb-3 text-lg font-semibold">Session Notes</h2>
        <div className="rounded-lg border border-border bg-card p-4">
          <RichTextDisplay content={session.notesBody as JSONContent} />
        </div>
      </div>

      {/* Follow-up Actions */}
      {session.followUpActions && (
        <div>
          <h2 className="mb-3 text-lg font-semibold">Follow-Up Actions</h2>
          <div className="rounded-lg border border-border bg-card p-4">
            <RichTextDisplay content={session.followUpActions as JSONContent} />
          </div>
        </div>
      )}
    </div>
  );
}
