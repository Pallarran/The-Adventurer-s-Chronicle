import Link from "next/link";
import { BookOpen, CalendarDays, ArrowRight } from "lucide-react";
import { getRecentSessions } from "@/lib/actions/sessions";
import { getQuestStatusCounts } from "@/lib/actions/quests";
import { extractTextFromJson } from "@/lib/extract-text";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";

interface RecentSessionsProps {
  campaignId: string;
}

export async function RecentSessions({ campaignId }: RecentSessionsProps) {
  const [sessions, questCounts] = await Promise.all([
    getRecentSessions(campaignId, 3),
    getQuestStatusCounts(campaignId),
  ]);
  const hasQuests = questCounts.active > 0 || questCounts.leads > 0;

  if (sessions.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No Sessions Yet"
        description="Log your first session to see a recap here on your dashboard."
        className="h-full"
      >
        <Link
          href="/sessions/new"
          className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >
          <BookOpen className="mr-2 h-4 w-4" />
          Log First Session
        </Link>
      </EmptyState>
    );
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-gold">
            <BookOpen className="h-5 w-5" />
            Recent Sessions
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasQuests && (
              <Link href="/quests" className="flex items-center gap-1.5">
                {questCounts.active > 0 && (
                  <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                    <span className="mr-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
                    {questCounts.active} active
                  </Badge>
                )}
                {questCounts.leads > 0 && (
                  <Badge variant="outline" className="border-amber-500/30 text-amber-400">
                    <span className="mr-1 h-1.5 w-1.5 rounded-full bg-amber-500" />
                    {questCounts.leads} {questCounts.leads === 1 ? "lead" : "leads"}
                  </Badge>
                )}
              </Link>
            )}
            <Link
              href="/sessions"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              View all
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="relative space-y-0">
          {sessions.map((session, index) => {
            const isFirst = index === 0;
            const excerpt = extractTextFromJson(
              session.notesBody,
              isFirst ? 400 : 120
            );
            const isLast = index === sessions.length - 1;

            return (
              <Link
                key={session.id}
                href={`/sessions/${session.id}`}
                className="group relative flex gap-3 pb-4 last:pb-0"
              >
                {/* Timeline line + dot */}
                <div className="flex flex-col items-center">
                  <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold ring-2 ring-background" />
                  {!isLast && (
                    <div className="w-px flex-1 bg-border" />
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1 pb-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold text-gold">
                      #{session.sessionNumber}
                    </span>
                    {session.title && (
                      <span className="truncate text-sm font-medium text-foreground group-hover:text-gold/80">
                        {session.title}
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarDays className="h-3 w-3 shrink-0" />
                    {new Date(session.realDatePlayed).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {session.inGameDate && (
                      <span className="ml-1 text-muted-foreground/60">
                        · {session.inGameDate}
                      </span>
                    )}
                  </div>
                  {excerpt && (
                    <p className={`mt-1 text-xs text-muted-foreground/80 ${isFirst ? "line-clamp-4" : "line-clamp-1"}`}>
                      {excerpt}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
