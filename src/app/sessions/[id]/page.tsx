import { notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/actions/sessions";
import { getQuestStatusChangesForSession } from "@/lib/actions/quests";
import { PageHeaderSetter } from "@/components/layout/page-header-setter";
import { RichTextDisplay } from "@/components/shared/rich-text-display";
import { SessionQuestRow } from "@/components/sessions/session-quest-row";
import { badgeVariants } from "@/components/ui/badge";
import { cn, formatSessionDate } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button-variants";
import { Pencil, CalendarDays, ScrollText, Users, MapPin, Shield, Compass, History } from "lucide-react";
import { SessionDeleteButton } from "./delete-button";
import { SessionSummaryBlock } from "./summary-block";
import { QUEST_STATUS_ORDER, QUEST_STATUS_STYLES } from "@/lib/quest-status";
import { QUEST_STATUS_COLORS, QUEST_STATUS_LABELS } from "@/lib/colors";
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

  const questUpdates = (await getQuestStatusChangesForSession(id)).filter(
    (c) => !c.quest.deletedAt
  );

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
          Played {formatSessionDate(session.realDatePlayed)}
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

      {/* AI Summary */}
      <SessionSummaryBlock
        sessionId={session.id}
        summary={session.summary}
        hasNotes={!!session.notesBody}
      />

      {/* Relations */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* Quests & Goals — progression-table style */}
      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border px-3 py-2 text-sm font-medium">
          <Compass className="h-4 w-4" />
          Quests & Goals
        </div>

        {session.quests.length > 0 ? (
          <div className="divide-y divide-border/30">
            {session.quests.map((q) => (
              <SessionQuestRow
                key={q.quest.id}
                questId={q.quest.id}
                sessionId={session.id}
                name={q.quest.name}
                description={q.quest.description}
                initialStatus={q.quest.status}
              />
            ))}
          </div>
        ) : (
          <div className="px-3 py-4 text-center text-sm text-muted-foreground/60">
            No quests or goals noted for this session.
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border px-3 py-2 text-[11px] text-muted-foreground/60">
          {QUEST_STATUS_ORDER.map((value) => (
            <span key={value} className="flex items-center gap-1">
              <span className={cn("h-2 w-2 rounded-full", QUEST_STATUS_STYLES[value].dotClass)} />
              {QUEST_STATUS_STYLES[value].label}
            </span>
          ))}
        </div>
      </div>

      {/* Quest updates made in this session */}
      {questUpdates.length > 0 && (
        <div className="mt-6 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border px-3 py-2 text-sm font-medium">
            <History className="h-4 w-4" />
            Quest Updates This Session
          </div>
          <div className="divide-y divide-border/30">
            {questUpdates.map((c) => {
              const color = QUEST_STATUS_COLORS[c.toStatus];
              return (
                <Link
                  key={c.id}
                  href={`/quests/${c.quest.id}`}
                  className="flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-muted/30"
                >
                  <span
                    className="inline-flex shrink-0 items-center rounded-full border border-transparent px-2 py-0.5 text-xs font-medium"
                    style={{ backgroundColor: `${color}20`, color }}
                  >
                    {QUEST_STATUS_LABELS[c.toStatus]}
                  </span>
                  <span className="shrink-0 font-medium">{c.quest.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {c.fromStatus
                      ? `${QUEST_STATUS_LABELS[c.fromStatus]} → ${QUEST_STATUS_LABELS[c.toStatus]}`
                      : "created"}
                  </span>
                  {c.note && (
                    <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground/70">— {c.note}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
