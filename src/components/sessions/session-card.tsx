import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CalendarDays, Users, MapPin, Shield } from "lucide-react";
import type { SessionListItem } from "@/types";

interface SessionCardProps {
  session: SessionListItem;
}

export function SessionCard({ session }: SessionCardProps) {
  return (
    <Link href={`/sessions/${session.id}`}>
      <Card className="transition-colors hover:border-gold/30 hover:bg-card/80">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-gold">
                  #{session.sessionNumber}
                </span>
                {session.title && (
                  <span className="text-sm font-medium text-foreground">
                    {session.title}
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays className="h-3 w-3" />
                {new Date(session.realDatePlayed).toLocaleDateString()}
                {session.inGameDate && (
                  <span className="ml-2 text-arcane-teal">
                    {session.inGameDate}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {session.npcs.length > 0 && (
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {session.npcs.length} NPC{session.npcs.length !== 1 && "s"}
              </span>
            )}
            {session.locations.length > 0 && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {session.locations.length} location{session.locations.length !== 1 && "s"}
              </span>
            )}
            {session.organizations.length > 0 && (
              <span className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                {session.organizations.length} org{session.organizations.length !== 1 && "s"}
              </span>
            )}
          </div>
          {session.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {session.tags.map((t) => (
                <Badge key={t.tag.id} variant="outline" className="text-xs">
                  {t.tag.name}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
