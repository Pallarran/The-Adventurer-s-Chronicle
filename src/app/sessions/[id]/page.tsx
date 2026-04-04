import { notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/actions/sessions";
import { PageHeaderSetter } from "@/components/layout/page-header-setter";
import { RichTextDisplay } from "@/components/shared/rich-text-display";
import { badgeVariants } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button-variants";
import { Pencil, CalendarDays, ScrollText, Users, MapPin, Shield, Compass } from "lucide-react";
import { SessionDeleteButton } from "./delete-button";
import type { JSONContent } from "@tiptap/react";

const QUEST_STATUS: { value: string; label: string; borderClass: string; dotClass: string }[] = [
  { value: "LEAD", label: "Lead", borderClass: "border-l-amber-500", dotClass: "bg-amber-500" },
  { value: "ACTIVE", label: "Active", borderClass: "border-l-blue-500", dotClass: "bg-blue-500" },
  { value: "COMPLETED", label: "Completed", borderClass: "border-l-emerald-500", dotClass: "bg-emerald-500" },
  { value: "FAILED", label: "Failed", borderClass: "border-l-red-500", dotClass: "bg-red-500" },
];

const QUEST_CONFIG = Object.fromEntries(QUEST_STATUS.map((s) => [s.value, s]));

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
          Played {new Date(session.realDatePlayed).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
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
            {session.quests.map((q) => {
              const cfg = QUEST_CONFIG[q.quest.status] ?? QUEST_STATUS[0];
              return (
                <Link
                  key={q.quest.id}
                  href={`/quests/${q.quest.id}`}
                  className={cn(
                    "grid grid-cols-[10px_minmax(0,1fr)_minmax(0,1.5fr)] items-center gap-2 border-l-2 px-3 py-2 text-sm transition-colors hover:bg-muted/30",
                    cfg.borderClass
                  )}
                >
                  <span className={cn("h-2.5 w-2.5 rounded-full", cfg.dotClass)} />
                  <span className="truncate font-medium">{q.quest.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {q.quest.description || ""}
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="px-3 py-4 text-center text-sm text-muted-foreground/60">
            No quests or goals noted for this session.
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border px-3 py-2 text-[11px] text-muted-foreground/60">
          {QUEST_STATUS.map((s) => (
            <span key={s.value} className="flex items-center gap-1">
              <span className={cn("h-2 w-2 rounded-full", s.dotClass)} />
              {s.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
