import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";
import { QUEST_STATUS_COLORS } from "@/lib/colors";
import { extractTextFromJson } from "@/lib/extract-text";
import type { SessionListItem } from "@/types";

interface SessionCardProps {
  session: SessionListItem;
}

export function SessionCard({ session }: SessionCardProps) {
  const excerpt = extractTextFromJson(session.notesBody, 150);

  return (
    <Link href={`/sessions/${session.id}`}>
      <Card className="flex h-full flex-col overflow-hidden transition-colors hover:border-gem-jade/30 hover:bg-card/80 hover:shadow-lg hover:shadow-gem-jade/10">
        {/* Header — gold left accent */}
        <div className="flex items-baseline gap-2 border-l-2 border-gold bg-muted/50 px-3 py-2">
          <span className="text-lg font-bold text-gold">
            #{session.sessionNumber}
          </span>
          {session.title && (
            <span className="truncate text-sm font-medium text-foreground">
              {session.title}
            </span>
          )}
        </div>

        {/* Notes excerpt */}
        <div className="flex-1 px-3 py-2">
          {excerpt ? (
            <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
              {excerpt}
            </p>
          ) : (
            <p className="text-xs italic text-muted-foreground/50">
              No notes yet
            </p>
          )}
        </div>

        {/* Quest status dots */}
        {session.quests.length > 0 && (
          <div className="space-y-0.5 px-3 pb-1">
            {session.quests.slice(0, 2).map((q) => (
              <div
                key={q.quest.id}
                className="flex items-center gap-1.5 text-xs"
              >
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: QUEST_STATUS_COLORS[q.quest.status] }}
                />
                <span className="truncate" style={{ color: QUEST_STATUS_COLORS[q.quest.status] }}>
                  {q.quest.name}
                </span>
              </div>
            ))}
            {session.quests.length > 2 && (
              <span className="text-xs text-muted-foreground/60">
                +{session.quests.length - 2} more
              </span>
            )}
          </div>
        )}

        {/* Footer — dates & tags */}
        <div className="space-y-1 border-t border-border/50 px-3 py-1.5">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarDays className="h-3 w-3 shrink-0" />
            {new Date(session.realDatePlayed).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
            {session.inGameDate && (
              <span className="text-muted-foreground/60">
                · {session.inGameDate}
              </span>
            )}
          </div>
          {session.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {session.tags.slice(0, 2).map((t) => (
                <Badge key={t.tag.id} variant="outline" className="px-1.5 py-0 text-xs">
                  {t.tag.name}
                </Badge>
              ))}
              {session.tags.length > 2 && (
                <span className="text-xs text-muted-foreground">+{session.tags.length - 2}</span>
              )}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
