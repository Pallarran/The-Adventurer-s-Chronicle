import { notFound } from "next/navigation";
import Link from "next/link";
import { getQuest } from "@/lib/actions/quests";
import { PageHeaderSetter } from "@/components/layout/page-header-setter";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button-variants";
import { Pencil, ScrollText, User, History } from "lucide-react";
import { QuestDeleteButton } from "./delete-button";
import { QuestStatusTimeline } from "@/components/quests/quest-status-timeline";
import { QUEST_STATUS_COLORS, QUEST_STATUS_LABELS } from "@/lib/colors";
import { RESOLVED_STATUSES } from "@/lib/quest-status";

export const dynamic = "force-dynamic";

export default async function QuestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quest = await getQuest(id);
  if (!quest) notFound();

  const statusColor = QUEST_STATUS_COLORS[quest.status] ?? "#6a6a7a";

  // Lifecycle anchors derived from the status history.
  const changes = quest.statusChanges;
  const firstSeen =
    changes.find((c) => c.session)?.session ??
    [...quest.sessions].sort(
      (a, b) => a.session.sessionNumber - b.session.sessionNumber
    )[0]?.session ??
    null;
  const resolvedSession = RESOLVED_STATUSES.includes(quest.status)
    ? [...changes].reverse().find((c) => RESOLVED_STATUSES.includes(c.toStatus) && c.session)
        ?.session ?? null
    : null;

  return (
    <div>
      <PageHeaderSetter
        title={quest.name}
        backHref="/quests"
        backLabel="Quests & Goals"
      />

      <div className="flex items-center gap-2 pb-4">
        <Link href={`/quests/${quest.id}/edit`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </Link>
        <QuestDeleteButton id={quest.id} />
      </div>

      {/* Status badge + quest giver */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Badge
          variant="outline"
          className="text-sm border-transparent"
          style={{
            backgroundColor: `${statusColor}20`,
            color: statusColor,
            borderColor: `${statusColor}40`,
          }}
        >
          {QUEST_STATUS_LABELS[quest.status] ?? quest.status}
        </Badge>
        {quest.questGiver && (
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            Given by
            <Link
              href={`/npcs/${quest.questGiver.id}`}
              className={cn(badgeVariants({ variant: "secondary" }))}
            >
              <User className="mr-1 h-3 w-3" />
              {quest.questGiver.name}
            </Link>
          </span>
        )}
        {(firstSeen || resolvedSession) && (
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            {firstSeen && (
              <>
                First seen
                <Link href={`/sessions/${firstSeen.id}`} className="text-foreground hover:underline">
                  #{firstSeen.sessionNumber}
                </Link>
              </>
            )}
            {firstSeen && resolvedSession && <span className="text-border">·</span>}
            {resolvedSession && (
              <>
                Resolved
                <Link href={`/sessions/${resolvedSession.id}`} className="text-foreground hover:underline">
                  #{resolvedSession.sessionNumber}
                </Link>
              </>
            )}
          </span>
        )}
      </div>

      {/* Description */}
      <div className="mb-6">
        <h2 className="mb-3 text-lg font-semibold">Description</h2>
        <div className="rounded-lg border border-border bg-card p-4">
          {quest.description ? (
            <p className="text-sm whitespace-pre-wrap">{quest.description}</p>
          ) : (
            <p className="text-sm italic text-muted-foreground/60">No description yet.</p>
          )}
        </div>
      </div>

      {/* Linked Sessions */}
      <div className="mb-6">
        <h2 className="mb-3 text-lg font-semibold">Linked Sessions</h2>
        <div className="rounded-lg border border-border bg-card p-4">
          {quest.sessions.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {quest.sessions
                .sort((a, b) => a.session.sessionNumber - b.session.sessionNumber)
                .map((s) => (
                  <Link
                    key={s.session.id}
                    href={`/sessions/${s.session.id}`}
                    className={cn(badgeVariants({ variant: "secondary" }))}
                  >
                    <ScrollText className="mr-1 h-3 w-3" />
                    #{s.session.sessionNumber}
                    {s.session.title ? ` — ${s.session.title}` : ""}
                  </Link>
                ))}
            </div>
          ) : (
            <p className="text-sm italic text-muted-foreground/60">Not linked to any sessions yet.</p>
          )}
        </div>
      </div>

      {/* Status history — horizontal timeline */}
      {changes.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
            <History className="h-4 w-4" />
            Status History
          </h2>
          <div className="overflow-hidden rounded-lg border border-border bg-card p-4">
            <QuestStatusTimeline
              nodes={changes.map((c) => ({
                id: c.id,
                status: c.toStatus,
                isCreation: c.fromStatus === null,
                sessionId: c.session?.id ?? null,
                sessionNumber: c.session?.sessionNumber ?? null,
                sessionTitle: c.session?.title ?? null,
                note: c.note,
              }))}
            />
          </div>
        </div>
      )}
    </div>
  );
}
