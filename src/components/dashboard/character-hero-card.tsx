import Image from "next/image";
import Link from "next/link";
import { Swords, ArrowRight } from "lucide-react";
import { getCharacterProfile } from "@/lib/actions/character";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";

interface CharacterHeroCardProps {
  campaignId: string;
}

export async function CharacterHeroCard({ campaignId }: CharacterHeroCardProps) {
  const profile = await getCharacterProfile(campaignId);

  if (!profile || !profile.name) {
    return (
      <EmptyState
        icon={Swords}
        title="No Character Profile"
        description="Create your character profile to see it showcased here on your dashboard."
        className="h-full"
      >
        <Link
          href="/character"
          className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          <Swords className="mr-2 h-4 w-4" />
          Create Character
        </Link>
      </EmptyState>
    );
  }

  return (
    <Card className="relative h-full overflow-hidden border-gold/20 bg-gradient-to-br from-card via-card to-gold/5 shadow-[0_0_15px_rgba(201,170,85,0.06)]">
      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-bl from-gold/8 to-transparent" />
      <div className="absolute bottom-0 left-0 h-20 w-20 bg-gradient-to-tr from-gold/4 to-transparent" />

      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gold">
          <Swords className="h-5 w-5" />
          Character
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {/* Portrait */}
        <div className="relative flex h-28 w-28 shrink-0 items-center justify-center self-center overflow-hidden rounded-lg border border-gold/20 bg-gold/5 shadow-[0_0_20px_rgba(201,170,85,0.08)] sm:self-start">
          {profile.portrait ? (
            <Image
              src={profile.portrait.startsWith("/") || profile.portrait.startsWith("http") ? profile.portrait : `/api/upload/${profile.portrait}`}
              alt={profile.name}
              fill
              className="object-cover"
              sizes="112px"
            />
          ) : (
            <Swords className="h-10 w-10 text-gold/40" />
          )}
        </div>

        {/* Info */}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-foreground">
              {profile.name}
            </h3>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              {profile.classInfo && (
                <Badge variant="secondary">{profile.classInfo}</Badge>
              )}
              {profile.level != null && (
                <Badge variant="outline">Level {profile.level}</Badge>
              )}
            </div>
          </div>

          {profile.summary && (
            <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
              {profile.summary}
            </p>
          )}

          <div className="mt-auto pt-2">
            <Link
              href="/character"
              className="inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium text-gold transition-colors hover:bg-gold/10"
            >
              View Full Profile
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
