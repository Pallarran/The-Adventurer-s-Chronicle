"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { JSONContent } from "@tiptap/react";
import { useFormGuard } from "@/hooks/use-form-guard";
import { Save, User, Loader2, Info } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { ImageUpload } from "@/components/shared/image-upload";
import { saveProfileTab, saveRoleplayTab } from "@/lib/actions/character";
import { toast } from "sonner";

// ── Form actions (rendered in the page header) ──

export function CharacterEditFormActions() {
  const router = useRouter();
  return (
    <>
      <Button type="submit" form="character-edit-form">
        <Save className="mr-2 h-4 w-4" />
        Save Changes
      </Button>
      <Button type="button" variant="outline" onClick={() => router.back()}>
        Cancel
      </Button>
    </>
  );
}

// ── Helpers ──

function SectionLabel({ label, description }: { label: string; description?: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <Label>{label}</Label>
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

function SectionGroupLabel({ label, description }: { label: string; description?: string }) {
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

// ── Types ──

interface CharacterSection {
  id: string;
  type: "OVERVIEW" | "BUILD" | "BACKSTORY";
  content: unknown;
}

interface CharacterEditFormProps {
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
}

function getSectionByType(
  sections: CharacterSection[],
  type: CharacterSection["type"]
): CharacterSection | undefined {
  return sections.find((s) => s.type === type);
}

// ── Main form ──

export function CharacterEditForm({ profile }: CharacterEditFormProps) {
  const router = useRouter();

  // ── Dirty tracking ──
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  useFormGuard(dirty);

  // ── Identity fields ──
  const [name, setName] = useState(profile.name);
  const [classInfo, setClassInfo] = useState(profile.classInfo ?? "");
  const [race, setRace] = useState(profile.race ?? "");
  const [level, setLevel] = useState<number | "">(profile.level ?? "");
  const [portrait, setPortrait] = useState<string | null>(profile.portrait ?? null);
  const [editingPortrait, setEditingPortrait] = useState(false);

  // ── Rich text refs ──
  const backstorySection = getSectionByType(profile.sections, "BACKSTORY");
  const backstoryRef = useRef<JSONContent | null>(
    (backstorySection?.content as JSONContent) ?? null
  );

  const overviewSection = getSectionByType(profile.sections, "OVERVIEW");
  const overviewRef = useRef<JSONContent | null>(
    (overviewSection?.content as JSONContent) ?? null
  );

  const personalityRef = useRef<JSONContent | null>(profile.personality ?? null);
  const idealsRef = useRef<JSONContent | null>(profile.ideals ?? null);
  const bondsRef = useRef<JSONContent | null>(profile.bonds ?? null);
  const flawsRef = useRef<JSONContent | null>(profile.flaws ?? null);
  const voiceRef = useRef<JSONContent | null>(profile.voiceMannerisms ?? null);
  const compassRef = useRef<JSONContent | null>(profile.compass ?? null);
  const contradictionsRef = useRef<JSONContent | null>(profile.contradictions ?? null);
  const pocketPhrasesRef = useRef<JSONContent | null>(profile.pocketPhrases ?? null);
  const remindersRef = useRef<JSONContent | null>(profile.reminders ?? null);
  const goalsRef = useRef<JSONContent | null>(profile.currentGoals ?? null);
  const fearsRef = useRef<JSONContent | null>(profile.fears ?? null);

  // ── Submit ──
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);

      try {
        await Promise.all([
          saveProfileTab(profile.id, {
            name: name.trim() || profile.name,
            classInfo: classInfo.trim() || null,
            race: race.trim() || null,
            level: level === "" ? null : Number(level),
            portrait,
            backstoryContent: backstoryRef.current,
          }),
          saveRoleplayTab(profile.id, {
            personality: personalityRef.current,
            ideals: idealsRef.current,
            bonds: bondsRef.current,
            flaws: flawsRef.current,
            voiceMannerisms: voiceRef.current,
            compass: compassRef.current,
            contradictions: contradictionsRef.current,
            pocketPhrases: pocketPhrasesRef.current,
            reminders: remindersRef.current,
            currentGoals: goalsRef.current,
            fears: fearsRef.current,
            overviewContent: overviewRef.current,
          }),
        ]);

        toast.success("Character saved.");
        router.push("/character");
      } catch {
        toast.error("Failed to save character.");
      } finally {
        setSaving(false);
      }
    },
    [profile.id, profile.name, name, classInfo, race, level, portrait, router]
  );

  return (
    <form
      id="character-edit-form"
      onSubmit={handleSubmit}
      onChange={() => setDirty(true)}
      className="space-y-6"
    >
      <fieldset disabled={saving} className="space-y-6">
        {/* ── Identity: portrait + fields ── */}
        <Card>
          <CardContent className="flex flex-col gap-6 sm:flex-row">
            {/* Portrait */}
            <div className="flex-shrink-0">
              {editingPortrait || !portrait ? (
                <div className="w-40">
                  <ImageUpload
                    value={portrait}
                    onChange={(path) => {
                      setPortrait(path);
                      setDirty(true);
                      if (path) setEditingPortrait(false);
                    }}
                    className="aspect-[2/3]"
                  />
                  {portrait && (
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      className="mt-1 w-full text-xs text-muted-foreground"
                      onClick={() => setEditingPortrait(false)}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  className="group relative w-40 aspect-[2/3] overflow-hidden rounded-lg border border-border transition-colors hover:border-gold/50"
                  onClick={() => setEditingPortrait(true)}
                  title="Click to change portrait"
                >
                  <Image
                    src={`/api/upload/${portrait}`}
                    alt={name}
                    fill
                    className="object-contain"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <User className="h-6 w-6 text-gold" />
                  </div>
                </button>
              )}
            </div>

            {/* Fields */}
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-end gap-4">
                <div className="min-w-[200px] flex-1 space-y-1.5">
                  <Label htmlFor="char-name">Character Name</Label>
                  <Input
                    id="char-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Character name"
                  />
                </div>
                <div className="w-36 space-y-1.5">
                  <Label htmlFor="char-race">Race</Label>
                  <Input
                    id="char-race"
                    value={race}
                    onChange={(e) => setRace(e.target.value)}
                    placeholder="e.g. Half-Elf"
                  />
                </div>
                <div className="min-w-[180px] flex-1 space-y-1.5">
                  <Label htmlFor="char-class">Class / Subclass</Label>
                  <Input
                    id="char-class"
                    value={classInfo}
                    onChange={(e) => setClassInfo(e.target.value)}
                    placeholder="e.g. Paladin / Oath of Vengeance"
                  />
                </div>
              </div>
              <div className="w-24 space-y-1.5">
                <Label htmlFor="char-level">Level</Label>
                <Input
                  id="char-level"
                  type="number"
                  min={1}
                  max={20}
                  value={level}
                  onChange={(e) =>
                    setLevel(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  placeholder="Lvl"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Quick Summary ── */}
        <Card>
          <CardContent className="space-y-2">
            <div>
              <Label>Quick Summary</Label>
              <p className="text-xs text-muted-foreground">
                This appears on your dashboard as the character description.
              </p>
            </div>
            <RichTextEditor
              content={overviewRef.current}
              onChange={(content) => {
                overviewRef.current = content;
                setDirty(true);
              }}
              placeholder="A quick RP reference — personality snapshot, current mindset, tone notes..."
            />
          </CardContent>
        </Card>

        {/* ── Two-column: Backstory + RP fields ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left — Backstory */}
          <Card>
            <CardContent className="space-y-2">
              <Label>Backstory</Label>
              <RichTextEditor
                content={backstoryRef.current}
                onChange={(content) => {
                  backstoryRef.current = content;
                  setDirty(true);
                }}
                placeholder="Character backstory, origin story, key life events..."
              />
            </CardContent>
          </Card>

          {/* Right — All RP sections */}
          <Card>
            <CardContent className="space-y-5">
              {/* 1. Voice & Mannerisms */}
              <div className="space-y-1.5">
                <SectionLabel
                  label="Voice & Mannerisms"
                  description="How he speaks and moves. Speech patterns, verbal tics, physical tells."
                />
                <RichTextEditor
                  content={voiceRef.current}
                  onChange={(c) => { voiceRef.current = c; setDirty(true); }}
                  placeholder="Speech patterns, catchphrases, accent, verbal tics, physical mannerisms..."
                  minimal
                />
              </div>

              {/* 2. The Compass */}
              <div className="space-y-1.5">
                <SectionLabel
                  label="The Compass"
                  description="How he chooses under pressure. Decision-making defaults when things get complicated."
                />
                <RichTextEditor
                  content={compassRef.current}
                  onChange={(c) => { compassRef.current = c; setDirty(true); }}
                  placeholder="Decision-making defaults, moral compass, what he falls back on under pressure..."
                  minimal
                />
              </div>

              {/* 3. Character Traits 2×2 */}
              <div className="space-y-3">
                <SectionGroupLabel
                  label="Character Traits"
                  description="Personality, Ideals, Bonds, Flaws. The core sheet fields that anchor everything else."
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Personality Traits</Label>
                    <RichTextEditor
                      content={personalityRef.current}
                      onChange={(c) => { personalityRef.current = c; setDirty(true); }}
                      placeholder="e.g. Always optimistic, fidgets when nervous"
                      minimal
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Ideals</Label>
                    <RichTextEditor
                      content={idealsRef.current}
                      onChange={(c) => { idealsRef.current = c; setDirty(true); }}
                      placeholder="e.g. Freedom — everyone deserves to live free"
                      minimal
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Bonds</Label>
                    <RichTextEditor
                      content={bondsRef.current}
                      onChange={(c) => { bondsRef.current = c; setDirty(true); }}
                      placeholder="e.g. I owe my life to the priest who took me in"
                      minimal
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Flaws</Label>
                    <RichTextEditor
                      content={flawsRef.current}
                      onChange={(c) => { flawsRef.current = c; setDirty(true); }}
                      placeholder="e.g. I turn tail and run when things look bad"
                      minimal
                    />
                  </div>
                </div>
              </div>

              {/* 4. Contradictions */}
              <div className="space-y-1.5">
                <SectionLabel
                  label="Contradictions"
                  description="The internal tensions to inhabit, not resolve. What keeps him from flattening into a single trait."
                />
                <RichTextEditor
                  content={contradictionsRef.current}
                  onChange={(c) => { contradictionsRef.current = c; setDirty(true); }}
                  placeholder="Internal tensions, competing values, the contradictions that make him feel real..."
                  minimal
                />
              </div>

              {/* 5. Pocket Phrases */}
              <div className="space-y-1.5">
                <SectionLabel
                  label="Pocket Phrases"
                  description="Short lines ready to use when you blank at the table. Emergency lookup, not dialogue samples."
                />
                <RichTextEditor
                  content={pocketPhrasesRef.current}
                  onChange={(c) => { pocketPhrasesRef.current = c; setDirty(true); }}
                  placeholder="Go-to lines, signature expressions, things he'd actually say..."
                  minimal
                />
              </div>

              {/* 6. Reminders / At the Table */}
              <div className="space-y-1.5">
                <SectionLabel
                  label="Reminders / At the Table"
                  description="Self-correction notes. Traps to avoid and habits to hold."
                />
                <RichTextEditor
                  content={remindersRef.current}
                  onChange={(c) => { remindersRef.current = c; setDirty(true); }}
                  placeholder="Notes to self — things to remember during play, habits to break or keep..."
                  minimal
                />
              </div>

              {/* 7. Current Goals */}
              <div className="space-y-1.5">
                <SectionLabel
                  label="Current Goals"
                  description="What he's actively pursuing in the campaign. Short-term and long-term, updated as the story moves."
                />
                <RichTextEditor
                  content={goalsRef.current}
                  onChange={(c) => { goalsRef.current = c; setDirty(true); }}
                  placeholder="Short-term and long-term goals — what drives your character right now?"
                  minimal
                />
              </div>

              {/* 8. Fears & Motivations */}
              <div className="space-y-1.5">
                <SectionLabel
                  label="Fears & Motivations"
                  description="What drives him and what he's afraid to find. Internal life for session prep and quiet moments."
                />
                <RichTextEditor
                  content={fearsRef.current}
                  onChange={(c) => { fearsRef.current = c; setDirty(true); }}
                  placeholder="What scares your character? What pushes them forward?"
                  minimal
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </fieldset>
    </form>
  );
}
