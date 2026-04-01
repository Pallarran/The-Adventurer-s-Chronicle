import Image from "next/image";
import Link from "next/link";
import { Users, User } from "lucide-react";
import { getNpcs } from "@/lib/actions/npcs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";

interface PartyMembersProps {
  campaignId: string;
}

const statusColors: Record<string, string> = {
  ALIVE: "bg-status-alive",
  DEAD: "bg-status-dead",
  MISSING: "bg-status-missing",
  UNKNOWN: "bg-status-unknown",
};

const statusLabels: Record<string, string> = {
  ALIVE: "Alive",
  DEAD: "Dead",
  MISSING: "Missing",
  UNKNOWN: "Unknown",
};

export async function PartyMembers({ campaignId }: PartyMembersProps) {
  const partyNpcs = await getNpcs(campaignId, {
    partyMember: true,
    sortBy: "name",
    sortOrder: "asc",
  });

  if (partyNpcs.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No Party Members"
        description="Mark NPCs as party members from their profile to see them here. Party members are your allies and companions."
        className="h-full"
      >
        <Link
          href="/npcs"
          className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >
          <Users className="mr-2 h-4 w-4" />
          Browse NPCs
        </Link>
      </EmptyState>
    );
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gold">
          <Users className="h-5 w-5" />
          Party Members
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {partyNpcs.map((npc) => {
            const isDead = npc.status === "DEAD";
            return (
              <Link
                key={npc.id}
                href={`/npcs/${npc.id}`}
                className={`group flex items-start gap-3 rounded-lg border border-border bg-card/50 p-3 transition-colors hover:border-gold/30 hover:bg-gold/5 ${isDead ? "opacity-60" : ""}`}
              >
                <div className="relative flex w-20 aspect-[3/4] shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-gold/30 bg-gold/5 shadow-[0_0_12px_rgba(201,170,85,0.1)] transition-shadow group-hover:shadow-[0_0_18px_rgba(201,170,85,0.18)]">
                  {npc.mainImage ? (
                    <Image
                      src={npc.mainImage.startsWith("/") || npc.mainImage.startsWith("http") ? npc.mainImage : `/api/upload/${npc.mainImage}`}
                      alt={npc.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <User className="h-6 w-6 text-gold/40" />
                  )}
                  {/* Status dot */}
                  <span
                    className={`absolute right-0 bottom-0 h-3.5 w-3.5 rounded-full ring-2 ring-card ${statusColors[npc.status] ?? statusColors.UNKNOWN}`}
                    title={statusLabels[npc.status] ?? "Unknown"}
                  />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className={`truncate text-sm font-medium text-foreground group-hover:text-gold ${isDead ? "line-through" : ""}`}>
                    {npc.name}
                  </p>
                  {npc.race && (
                    <p className="truncate text-xs text-muted-foreground">{npc.race}</p>
                  )}
                  {npc.classRole && (
                    <p className="line-clamp-4 text-xs text-muted-foreground" title={npc.classRole}>{npc.classRole}</p>
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
