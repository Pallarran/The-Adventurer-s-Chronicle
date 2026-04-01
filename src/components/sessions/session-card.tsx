import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CalendarDays, ScrollText, Users, MapPin, Shield } from "lucide-react";
import type { SessionListItem } from "@/types";

interface SessionCardProps {
  session: SessionListItem;
}

export function SessionCard({ session }: SessionCardProps) {
  return (
    <Link href={`/sessions/${session.id}`}>
      <Card className="h-full overflow-hidden transition-colors hover:border-gold/30 hover:bg-card/80 hover:shadow-lg hover:shadow-gold/10">
        {/* Top area — same height as image in other cards */}
        <div className="flex aspect-[4/3] w-full flex-col">
          {/* Compact header */}
          <div className="flex items-baseline gap-2 bg-muted/50 px-3 py-2">
            <span className="text-lg font-bold text-gold">
              #{session.sessionNumber}
            </span>
            {session.title && (
              <span className="truncate text-sm font-medium text-foreground">
                {session.title}
              </span>
            )}
          </div>

          {/* Body — dates + space for future recap */}
          <div className="flex flex-1 flex-col px-3 py-2">
            <div className="space-y-0.5">
              <p className="truncate text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3 w-3 shrink-0" />
                  Played {new Date(session.realDatePlayed).toLocaleDateString()}
                </span>
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {session.inGameDate ? (
                  <span className="flex items-center gap-1">
                    <ScrollText className="h-3 w-3 shrink-0" />
                    In-game: {session.inGameDate}
                  </span>
                ) : (
                  "\u00A0"
                )}
              </p>
            </div>
            {/* Future: session recap / summary will go here */}
          </div>
        </div>

        {/* Footer — relation counts + tags */}
        <div className="flex min-h-[5.5rem] flex-col justify-end p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-3 text-xs text-muted-foreground">
              {session.npcs.length > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {session.npcs.length}
                </span>
              )}
              {session.locations.length > 0 && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {session.locations.length}
                </span>
              )}
              {session.organizations.length > 0 && (
                <span className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  {session.organizations.length}
                </span>
              )}
            </div>
            {session.tags.length > 0 && (
              <div className="flex shrink-0 gap-1">
                {session.tags.slice(0, 2).map((t) => (
                  <Badge key={t.tag.id} variant="outline" className="text-xs px-1.5 py-0">
                    {t.tag.name}
                  </Badge>
                ))}
                {session.tags.length > 2 && (
                  <span className="text-xs text-muted-foreground">+{session.tags.length - 2}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
