import Image from "next/image";
import Link from "next/link";
import { Swords, ArrowRight } from "lucide-react";
import { getCharacterProfile } from "@/lib/actions/character";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ImageLightbox } from "@/components/shared/image-lightbox";
import { RichTextDisplay } from "@/components/shared/rich-text-display";
import type { JSONContent } from "@tiptap/react";

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

  const overviewSection = profile.sections?.find((s) => s.type === "OVERVIEW");
  const hasOverviewContent =
    overviewSection?.content &&
    typeof overviewSection.content === "object" &&
    (overviewSection.content as JSONContent).content?.length;

  return (
    <Card className="relative h-full overflow-hidden border-gold/20 bg-gradient-to-br from-card via-card to-gold/5 shadow-[0_0_15px_rgba(201,170,85,0.06)]">
      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-bl from-gold/8 to-transparent" />
      <div className="absolute bottom-0 left-0 h-20 w-20 bg-gradient-to-tr from-gold/4 to-transparent" />

      <CardHeader className="relative z-10 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-gold">
            <Swords className="h-5 w-5" />
            Character
          </CardTitle>
          <Link
            href="/character"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-gold transition-colors"
          >
            View Profile
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {/* Portrait — larger with gold glow ring */}
        {profile.portrait ? (
          <ImageLightbox
            src={profile.portrait.startsWith("/") || profile.portrait.startsWith("http") ? profile.portrait : `/api/upload/${profile.portrait}`}
            alt={profile.name}
          >
            <div className="relative flex w-60 aspect-[2/3] shrink-0 items-center justify-center self-center overflow-hidden rounded-lg border-2 border-gold/30 bg-gold/5 shadow-[0_0_24px_rgba(201,170,85,0.12)] transition-shadow hover:shadow-[0_0_32px_rgba(201,170,85,0.2)] sm:self-start">
              <Image
                src={profile.portrait.startsWith("/") || profile.portrait.startsWith("http") ? profile.portrait : `/api/upload/${profile.portrait}`}
                alt={profile.name}
                fill
                className="object-contain"
                sizes="240px"
              />
            </div>
          </ImageLightbox>
        ) : (
          <Link
            href="/character"
            className="relative flex w-60 aspect-[2/3] shrink-0 items-center justify-center self-center overflow-hidden rounded-lg border-2 border-gold/30 bg-gold/5 sm:self-start"
          >
            <Swords className="h-14 w-14 text-gold/40" />
          </Link>
        )}

        {/* Info */}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-gold">
              {profile.name}
            </h3>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              {profile.race && (
                <Badge variant="outline" className="border-gold/30 text-gold">{profile.race}</Badge>
              )}
              {profile.classInfo && (
                <Badge variant="outline" className="border-gold/30 text-gold">{profile.classInfo}</Badge>
              )}
              {profile.level != null && (
                <Badge variant="outline" className="border-gold/30 text-gold">Level {profile.level}</Badge>
              )}
            </div>
          </div>

          {/* RP Anchors (Overview section) or Summary fallback */}
          {hasOverviewContent ? (
            <div className="mt-1">
              <div className="max-h-44 overflow-hidden text-muted-foreground">
                <RichTextDisplay
                  content={overviewSection!.content as JSONContent}
                  className="text-sm"
                />
              </div>
            </div>
          ) : profile.summary ? (
            <p className="mt-1 line-clamp-4 text-sm leading-relaxed text-muted-foreground">
              {profile.summary}
            </p>
          ) : (
            <p className="mt-1 text-sm italic text-muted-foreground/60">
              Add RP anchors in your{" "}
              <Link href="/character" className="text-gold/70 underline hover:text-gold">
                character profile
              </Link>{" "}
              to see them here.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
