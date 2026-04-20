"use client";

import Image from "next/image";
import Link from "next/link";
import type { JSONContent } from "@tiptap/react";
import { Pencil, Eye, BookOpen, Info } from "lucide-react";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { RichTextDisplay } from "@/components/shared/rich-text-display";
import { ImageLightbox } from "@/components/shared/image-lightbox";
import { ProgressionTable } from "./progression-table";

interface CharacterSection {
  id: string;
  type: "OVERVIEW" | "BUILD" | "BACKSTORY";
  content: unknown;
}

export interface ProgressionRow {
  id: string;
  rowType: "LEVEL" | "DOWNTIME" | "THEME";
  level: number | null;
  label: string | null;
  classLabel: string | null;
  features: string | null;
  spells: string | null;
  notes: string | null;
  status: "DONE" | "CURRENT" | "FUTURE";
  sortOrder: number;
}

interface CharacterHubClientProps {
  profile: {
    id: string;
    name: string;
    classInfo: string | null;
    race: string | null;
    level: number | null;
    portrait: string | null;
    summary: string | null;
    personality: JSONContent | null;
    ideals: JSONContent | null;
    bonds: JSONContent | null;
    flaws: JSONContent | null;
    voiceMannerisms: JSONContent | null;
    compass: JSONContent | null;
    contradictions: JSONContent | null;
    pocketPhrases: JSONContent | null;
    reminders: JSONContent | null;
    currentGoals: JSONContent | null;
    fears: JSONContent | null;
    sections: CharacterSection[];
  };
  progressionRows: ProgressionRow[];
}

function getSectionByType(
  sections: CharacterSection[],
  type: CharacterSection["type"]
): CharacterSection | undefined {
  return sections.find((s) => s.type === type);
}

/** Check if a Tiptap JSONContent has actual text/node content */
function hasContent(content: JSONContent | null | undefined): boolean {
  if (!content) return false;
  const nodes = content.content;
  if (!nodes || nodes.length === 0) return false;
  if (
    nodes.length === 1 &&
    nodes[0].type === "paragraph" &&
    (!nodes[0].content || nodes[0].content.length === 0)
  ) {
    return false;
  }
  return true;
}

function SectionLabel({ label, description }: { label: string; description?: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
        {label}
      </p>
      {description && (
        <Tooltip>
          <TooltipTrigger className="text-muted-foreground/40 hover:text-muted-foreground transition-colors">
            <Info className="h-3.5 w-3.5" />
          </TooltipTrigger>
          <TooltipContent side="top">{description}</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

function TraitCard({ label, content }: { label: string; content: JSONContent | null }) {
  if (!hasContent(content)) return null;
  return (
    <div className="space-y-1 rounded-lg border border-border p-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
        {label}
      </p>
      <RichTextDisplay content={content} className="text-sm" />
    </div>
  );
}

function SectionCard({
  label,
  description,
  content,
}: {
  label: string;
  description?: string;
  content: JSONContent | null;
}) {
  if (!hasContent(content)) return null;
  return (
    <div className="space-y-1.5 rounded-lg border border-border p-4">
      <SectionLabel label={label} description={description} />
      <RichTextDisplay content={content} className="text-sm" />
    </div>
  );
}

export function CharacterHubClient({
  profile,
  progressionRows,
}: CharacterHubClientProps) {
  const portraitSrc = profile.portrait
    ? profile.portrait.startsWith("/") || profile.portrait.startsWith("http")
      ? profile.portrait
      : `/api/upload/${profile.portrait}`
    : null;

  const backstorySection = getSectionByType(profile.sections, "BACKSTORY");
  const backstoryContent = (backstorySection?.content as JSONContent) ?? null;

  const overviewSection = getSectionByType(profile.sections, "OVERVIEW");
  const overviewContent = (overviewSection?.content as JSONContent) ?? null;

  const hasTraits =
    hasContent(profile.personality) ||
    hasContent(profile.ideals) ||
    hasContent(profile.bonds) ||
    hasContent(profile.flaws);
  const hasRightColumn =
    hasContent(profile.voiceMannerisms) ||
    hasContent(profile.compass) ||
    hasTraits ||
    hasContent(profile.contradictions) ||
    hasContent(profile.pocketPhrases) ||
    hasContent(profile.reminders) ||
    hasContent(profile.currentGoals) ||
    hasContent(profile.fears);
  const hasBackstory = hasContent(backstoryContent);

  return (
    <Tabs defaultValue="character">
      <div className="flex items-center gap-3">
        <TabsList>
          <TabsTrigger value="character">
            <Eye className="h-4 w-4" />
            Character
          </TabsTrigger>
          <TabsTrigger value="build">
            <BookOpen className="h-4 w-4" />
            Build
          </TabsTrigger>
        </TabsList>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/character/edit"
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>
        </div>
      </div>

      {/* ═══ CHARACTER VIEW TAB ═══ */}
      <TabsContent value="character">
        <div className="space-y-6">
          {/* Hero Banner */}
          <Card className="overflow-hidden border-gold/20 bg-gradient-to-br from-card via-card to-gold/5 shadow-[0_0_15px_rgba(201,170,85,0.06)]">
            <CardContent className="flex flex-col gap-6 sm:flex-row sm:items-start">
              {portraitSrc && (
                <div className="shrink-0 self-center sm:self-start">
                  <ImageLightbox src={portraitSrc} alt={profile.name}>
                    <div className="relative flex w-48 aspect-[2/3] items-center justify-center overflow-hidden rounded-lg border-2 border-gold/30 bg-gold/5 shadow-[0_0_24px_rgba(201,170,85,0.12)] transition-shadow hover:shadow-[0_0_32px_rgba(201,170,85,0.2)]">
                      <Image
                        src={portraitSrc}
                        alt={profile.name}
                        fill
                        className="object-contain"
                        sizes="192px"
                      />
                    </div>
                  </ImageLightbox>
                </div>
              )}

              <div className="flex min-w-0 flex-1 flex-col gap-3">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-gold">
                    {profile.name}
                  </h2>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
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

                {hasContent(overviewContent) && (
                  <div className="text-muted-foreground">
                    <RichTextDisplay content={overviewContent} className="text-sm" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Two-Column Body: Backstory left, RP fields right */}
          {(hasRightColumn || hasBackstory) && (
            <div className={`grid gap-6 ${hasRightColumn && hasBackstory ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
              {hasBackstory && (
                <div className="space-y-1.5 rounded-lg border border-border p-4">
                  <SectionLabel label="Backstory" />
                  <RichTextDisplay content={backstoryContent} className="text-sm" />
                </div>
              )}

              {hasRightColumn && (
                <div className="space-y-4">
                  <SectionCard
                    label="Voice & Mannerisms"
                    description="How he speaks and moves. Speech patterns, verbal tics, physical tells."
                    content={profile.voiceMannerisms}
                  />
                  <SectionCard
                    label="The Compass"
                    description="How he chooses under pressure. Decision-making defaults when things get complicated."
                    content={profile.compass}
                  />

                  {hasTraits && (
                    <div className="space-y-2">
                      <SectionLabel
                        label="Character Traits"
                        description="Personality, Ideals, Bonds, Flaws. The core sheet fields that anchor everything else."
                      />
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <TraitCard label="Personality" content={profile.personality} />
                        <TraitCard label="Ideals" content={profile.ideals} />
                        <TraitCard label="Bonds" content={profile.bonds} />
                        <TraitCard label="Flaws" content={profile.flaws} />
                      </div>
                    </div>
                  )}

                  <SectionCard
                    label="Contradictions"
                    description="The internal tensions to inhabit, not resolve. What keeps him from flattening into a single trait."
                    content={profile.contradictions}
                  />
                  <SectionCard
                    label="Pocket Phrases"
                    description="Short lines ready to use when you blank at the table. Emergency lookup, not dialogue samples."
                    content={profile.pocketPhrases}
                  />
                  <SectionCard
                    label="Reminders / At the Table"
                    description="Self-correction notes. Traps to avoid and habits to hold."
                    content={profile.reminders}
                  />
                  <SectionCard
                    label="Current Goals"
                    description="What he's actively pursuing in the campaign. Short-term and long-term, updated as the story moves."
                    content={profile.currentGoals}
                  />
                  <SectionCard
                    label="Fears & Motivations"
                    description="What drives him and what he's afraid to find. Internal life for session prep and quiet moments."
                    content={profile.fears}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </TabsContent>

      {/* ═══ BUILD PROGRESSION TAB ═══ */}
      <TabsContent value="build">
        <ProgressionTable rows={progressionRows} profileId={profile.id} characterLevel={profile.level} />
      </TabsContent>
    </Tabs>
  );
}
