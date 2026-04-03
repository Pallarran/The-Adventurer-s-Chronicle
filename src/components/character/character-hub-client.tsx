"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import type { JSONContent } from "@tiptap/react";
import { useFormGuard } from "@/hooks/use-form-guard";
import {
  Save,
  User,
  Swords,
  BookOpen,
  Check,
  Loader2,
} from "lucide-react";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { ImageUpload } from "@/components/shared/image-upload";
import { ProgressionTable } from "./progression-table";
import { saveProfileTab, saveRoleplayTab } from "@/lib/actions/character";

type SaveStatus = "idle" | "saving" | "saved";

interface CharacterSection {
  id: string;
  type: "OVERVIEW" | "BUILD" | "BACKSTORY";
  content: any;
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
    personality: string | null;
    ideals: string | null;
    bonds: string | null;
    flaws: string | null;
    voiceMannerisms: string | null;
    currentGoals: string | null;
    fears: string | null;
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

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === "saving") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        Saving...
      </span>
    );
  }
  if (status === "saved") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-arcane-teal">
        <Check className="h-3 w-3" />
        Saved
      </span>
    );
  }
  return null;
}

export function CharacterHubClient({
  profile,
  progressionRows,
}: CharacterHubClientProps) {
  // ── Dirty tracking ──
  const [profileDirty, setProfileDirty] = useState(false);
  const [rpDirty, setRpDirty] = useState(false);
  useFormGuard(profileDirty || rpDirty);

  // ── Profile tab state ──
  const [name, setName] = useState(profile.name);
  const [classInfo, setClassInfo] = useState(profile.classInfo ?? "");
  const [race, setRace] = useState(profile.race ?? "");
  const [level, setLevel] = useState<number | "">(profile.level ?? "");
  const [portrait, setPortrait] = useState<string | null>(profile.portrait ?? null);
  const [editingPortrait, setEditingPortrait] = useState(false);
  const [profileSaveStatus, setProfileSaveStatus] = useState<SaveStatus>("idle");

  const backstorySection = getSectionByType(profile.sections, "BACKSTORY");
  const backstoryContentRef = useRef<JSONContent | null>(
    (backstorySection?.content as JSONContent) ?? null
  );

  // ── Roleplay tab state ──
  const [personality, setPersonality] = useState(profile.personality ?? "");
  const [ideals, setIdeals] = useState(profile.ideals ?? "");
  const [bonds, setBonds] = useState(profile.bonds ?? "");
  const [flaws, setFlaws] = useState(profile.flaws ?? "");
  const [voiceMannerisms, setVoiceMannerisms] = useState(profile.voiceMannerisms ?? "");
  const [currentGoals, setCurrentGoals] = useState(profile.currentGoals ?? "");
  const [fears, setFears] = useState(profile.fears ?? "");
  const [rpSaveStatus, setRpSaveStatus] = useState<SaveStatus>("idle");

  const overviewSection = getSectionByType(profile.sections, "OVERVIEW");
  const overviewContentRef = useRef<JSONContent | null>(
    (overviewSection?.content as JSONContent) ?? null
  );

  // ── Saved indicator timer ──
  const savedTimerRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const showSaved = useCallback(
    (setter: React.Dispatch<React.SetStateAction<SaveStatus>>, key: string) => {
      setter("saved");
      if (savedTimerRef.current[key]) clearTimeout(savedTimerRef.current[key]);
      savedTimerRef.current[key] = setTimeout(() => setter("idle"), 2000);
    },
    []
  );

  // ── Profile tab save ──
  const handleSaveProfile = useCallback(async () => {
    setProfileSaveStatus("saving");
    try {
      await saveProfileTab(profile.id, {
        name: name.trim() || profile.name,
        classInfo: classInfo.trim() || null,
        race: race.trim() || null,
        level: level === "" ? null : Number(level),
        portrait,
        backstoryContent: backstoryContentRef.current,
      });
      showSaved(setProfileSaveStatus, "profile");
      setProfileDirty(false);
    } catch (err) {
      console.error("Failed to save profile:", err);
      setProfileSaveStatus("idle");
    }
  }, [profile.id, profile.name, name, classInfo, race, level, portrait, showSaved]);

  // ── Roleplay tab save ──
  const handleSaveRoleplay = useCallback(async () => {
    setRpSaveStatus("saving");
    try {
      await saveRoleplayTab(profile.id, {
        personality: personality.trim() || null,
        ideals: ideals.trim() || null,
        bonds: bonds.trim() || null,
        flaws: flaws.trim() || null,
        voiceMannerisms: voiceMannerisms.trim() || null,
        currentGoals: currentGoals.trim() || null,
        fears: fears.trim() || null,
        overviewContent: overviewContentRef.current,
      });
      showSaved(setRpSaveStatus, "roleplay");
      setRpDirty(false);
    } catch (err) {
      console.error("Failed to save roleplay:", err);
      setRpSaveStatus("idle");
    }
  }, [profile.id, personality, ideals, bonds, flaws, voiceMannerisms, currentGoals, fears, showSaved]);

  const [activeTab, setActiveTab] = useState(0);

  return (
    <Tabs defaultValue={0} onValueChange={(val) => setActiveTab(val as number)}>
      <div className="flex items-center gap-3">
        <TabsList>
          <TabsTrigger value={0}>
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value={1}>
            <Swords className="h-4 w-4" />
            Roleplay
          </TabsTrigger>
          <TabsTrigger value={2}>
            <BookOpen className="h-4 w-4" />
            Build
          </TabsTrigger>
        </TabsList>

        {/* Save buttons — right-aligned, visible per tab */}
        <div className="ml-auto flex items-center gap-2">
          {activeTab === 0 && (
            <>
              <SaveIndicator status={profileSaveStatus} />
              <Button
                size="sm"
                onClick={handleSaveProfile}
                disabled={profileSaveStatus === "saving"}
                className="gap-1.5"
              >
                {profileSaveStatus === "saving" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Profile
              </Button>
            </>
          )}
          {activeTab === 1 && (
            <>
              <SaveIndicator status={rpSaveStatus} />
              <Button
                size="sm"
                onClick={handleSaveRoleplay}
                disabled={rpSaveStatus === "saving"}
                className="gap-1.5"
              >
                {rpSaveStatus === "saving" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Roleplay
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ═══ PROFILE TAB ═══ */}
      <TabsContent value={0}>
        <Card>
          <CardContent className="space-y-6" onChange={() => setProfileDirty(true)}>
            {/* Identity: portrait left, fields right */}
            <div className="flex flex-col gap-6 sm:flex-row">
              {/* Portrait */}
              <div className="flex-shrink-0">
                {editingPortrait || !portrait ? (
                  <div className="w-40">
                    <ImageUpload
                      value={portrait}
                      onChange={(path) => {
                        setPortrait(path);
                        if (path) setEditingPortrait(false);
                      }}
                      className="aspect-[2/3]"
                    />
                    {portrait && (
                      <Button
                        variant="ghost"
                        size="sm"
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
            </div>

            {/* Backstory */}
            <div className="space-y-2">
              <Label>Backstory</Label>
              <RichTextEditor
                content={backstoryContentRef.current}
                onChange={(content) => {
                  backstoryContentRef.current = content;
                  setProfileDirty(true);
                }}
                placeholder="Character backstory, origin story, key life events..."
              />
            </div>

          </CardContent>
        </Card>
      </TabsContent>

      {/* ═══ ROLEPLAY TAB ═══ */}
      <TabsContent value={1}>
        <Card>
          <CardContent className="space-y-6" onChange={() => setRpDirty(true)}>
            {/* Quick Summary */}
            <div className="space-y-2">
              <div>
                <Label>Quick Summary</Label>
                <p className="text-xs text-muted-foreground">
                  This appears on your dashboard as the character description.
                </p>
              </div>
              <RichTextEditor
                content={overviewContentRef.current}
                onChange={(content) => {
                  overviewContentRef.current = content;
                  setRpDirty(true);
                }}
                placeholder="A quick RP reference — personality snapshot, current mindset, tone notes..."
              />
            </div>

            {/* D&D Standard: Traits / Ideals / Bonds / Flaws */}
            <div className="space-y-4 rounded-lg border border-border p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
                Character Traits
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="rp-personality">Personality Traits</Label>
                  <Input
                    id="rp-personality"
                    value={personality}
                    onChange={(e) => setPersonality(e.target.value)}
                    placeholder="e.g. Always optimistic, fidgets when nervous"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rp-ideals">Ideals</Label>
                  <Input
                    id="rp-ideals"
                    value={ideals}
                    onChange={(e) => setIdeals(e.target.value)}
                    placeholder="e.g. Freedom — everyone deserves to live free"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rp-bonds">Bonds</Label>
                  <Input
                    id="rp-bonds"
                    value={bonds}
                    onChange={(e) => setBonds(e.target.value)}
                    placeholder="e.g. I owe my life to the priest who took me in"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rp-flaws">Flaws</Label>
                  <Input
                    id="rp-flaws"
                    value={flaws}
                    onChange={(e) => setFlaws(e.target.value)}
                    placeholder="e.g. I turn tail and run when things look bad"
                  />
                </div>
              </div>
            </div>

            {/* Voice, Goals, Fears */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="rp-voice">Voice & Mannerisms</Label>
                <Textarea
                  id="rp-voice"
                  value={voiceMannerisms}
                  onChange={(e) => setVoiceMannerisms(e.target.value)}
                  placeholder="Speech patterns, catchphrases, accent, verbal tics, physical mannerisms..."
                  rows={3}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rp-goals">Current Goals</Label>
                <Textarea
                  id="rp-goals"
                  value={currentGoals}
                  onChange={(e) => setCurrentGoals(e.target.value)}
                  placeholder="Short-term and long-term goals — what drives your character right now?"
                  rows={3}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rp-fears">Fears & Motivations</Label>
                <Textarea
                  id="rp-fears"
                  value={fears}
                  onChange={(e) => setFears(e.target.value)}
                  placeholder="What scares your character? What pushes them forward?"
                  rows={3}
                />
              </div>
            </div>

          </CardContent>
        </Card>
      </TabsContent>

      {/* ═══ BUILD PROGRESSION TAB ═══ */}
      <TabsContent value={2}>
        <ProgressionTable rows={progressionRows} profileId={profile.id} characterLevel={profile.level} />
      </TabsContent>
    </Tabs>
  );
}
