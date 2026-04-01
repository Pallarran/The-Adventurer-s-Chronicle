import Link from "next/link";
import { BookOpen, CalendarDays, ArrowRight, ListChecks } from "lucide-react";
import { getRecentSessions } from "@/lib/actions/sessions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";

interface RecentSessionsProps {
  campaignId: string;
}

function extractTextFromJson(json: unknown, maxLength: number = 120): string {
  if (!json || typeof json !== "object") return "";
  const node = json as { text?: string; content?: unknown[] };
  if (node.text) return node.text;
  if (Array.isArray(node.content)) {
    let result = "";
    for (const child of node.content) {
      result += extractTextFromJson(child, maxLength);
      if (result.length >= maxLength) break;
    }
    return result;
  }
  return "";
}

function countTaskItems(json: unknown): number {
  if (!json || typeof json !== "object") return 0;
  const node = json as { type?: string; content?: unknown[] };
  let count = 0;
  if (node.type === "taskItem") count++;
  if (Array.isArray(node.content)) {
    for (const child of node.content) {
      count += countTaskItems(child);
    }
  }
  return count;
}

export async function RecentSessions({ campaignId }: RecentSessionsProps) {
  const sessions = await getRecentSessions(campaignId, 5);

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
          <Link
            href="/sessions"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            View all
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="relative space-y-0">
          {sessions.map((session, index) => {
            const excerpt = extractTextFromJson(session.notesBody, 120);
            const isLast = index === sessions.length - 1;
            const isFirst = index === 0;
            const followUpCount = isFirst ? countTaskItems(session.followUpActions) : 0;

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
                    {followUpCount > 0 && (
                      <Badge variant="secondary" className="ml-auto shrink-0 gap-1 text-[10px] px-1.5 py-0">
                        <ListChecks className="h-3 w-3" />
                        {followUpCount}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarDays className="h-3 w-3 shrink-0" />
                    {new Date(session.realDatePlayed).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                    {session.inGameDate && (
                      <span className="ml-1 text-muted-foreground/60">
                        · {session.inGameDate}
                      </span>
                    )}
                  </div>
                  {excerpt && (
                    <p className="mt-1 line-clamp-1 text-xs text-muted-foreground/80">
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
