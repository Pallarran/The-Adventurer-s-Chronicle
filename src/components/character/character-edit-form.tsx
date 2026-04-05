"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { JSONContent } from "@tiptap/react";
import { useFormGuard } from "@/hooks/use-form-guard";
import { Save, User, Loader2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

          {/* Right — Voice, Goals, Fears */}
          <div className="space-y-6">
            <Card>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Voice & Mannerisms</Label>
                  <RichTextEditor
                    content={voiceRef.current}
                    onChange={(c) => { voiceRef.current = c; setDirty(true); }}
                    placeholder="Speech patterns, catchphrases, accent, verbal tics, physical mannerisms..."
                    minimal
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Current Goals</Label>
                  <RichTextEditor
                    content={goalsRef.current}
                    onChange={(c) => { goalsRef.current = c; setDirty(true); }}
                    placeholder="Short-term and long-term goals — what drives your character right now?"
                    minimal
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Fears & Motivations</Label>
                  <RichTextEditor
                    content={fearsRef.current}
                    onChange={(c) => { fearsRef.current = c; setDirty(true); }}
                    placeholder="What scares your character? What pushes them forward?"
                    minimal
                  />
                </div>
              </CardContent>
            </Card>

            {/* Character Traits 2×2 */}
            <Card>
              <CardContent className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
                  Character Traits
                </p>
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
              </CardContent>
            </Card>
          </div>
        </div>
      </fieldset>
    </form>
  );
}
