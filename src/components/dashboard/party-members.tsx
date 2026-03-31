import Image from "next/image";
import Link from "next/link";
import { Users, User } from "lucide-react";
import { getNpcs } from "@/lib/actions/npcs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PartyMembersProps {
  campaignId: string;
}

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
          className={cn(buttonVariants({ variant: "outline" }))}
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
          {partyNpcs.map((npc) => (
            <Link
              key={npc.id}
              href={`/npcs/${npc.id}`}
              className="group flex flex-col items-center gap-2 rounded-lg border border-border bg-card/50 p-3 transition-colors hover:border-gold/30 hover:bg-gold/5"
            >
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
                {npc.mainImage ? (
                  <Image
                    src={npc.mainImage}
                    alt={npc.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                ) : (
                  <User className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 text-center">
                <p className="truncate text-sm font-medium text-foreground group-hover:text-gold">
                  {npc.name}
                </p>
                {npc.classRole && (
                  <p className="truncate text-xs text-muted-foreground">
                    {npc.classRole}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
