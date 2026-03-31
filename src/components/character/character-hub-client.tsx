"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import type { JSONContent } from "@tiptap/react";
import { Save, User, Swords, BookOpen, Scroll, Check, Loader2 } from "lucide-react";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { ImageUpload } from "@/components/shared/image-upload";
import {
  updateCharacterProfile,
  updateCharacterSection,
} from "@/lib/actions/character";

type SaveStatus = "idle" | "saving" | "saved";

interface CharacterSection {
  id: string;
  type: "OVERVIEW" | "BUILD" | "BACKSTORY";
  content: any;
}

interface CharacterHubClientProps {
  profile: {
    id: string;
    name: string;
    classInfo: string | null;
    level: number | null;
    portrait: string | null;
    summary: string | null;
    sections: CharacterSection[];
  };
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

export function CharacterHubClient({ profile }: CharacterHubClientProps) {
  // Profile fields
  const [name, setName] = useState(profile.name);
  const [classInfo, setClassInfo] = useState(profile.classInfo ?? "");
  const [level, setLevel] = useState<number | "">(profile.level ?? "");
  const [portrait, setPortrait] = useState<string | null>(
    profile.portrait ?? null
  );
  const [profileSaveStatus, setProfileSaveStatus] =
    useState<SaveStatus>("idle");

  // Section content — tracked with refs to avoid re-renders from the editor
  const overviewSection = getSectionByType(profile.sections, "OVERVIEW");
  const buildSection = getSectionByType(profile.sections, "BUILD");
  const backstorySection = getSectionByType(profile.sections, "BACKSTORY");

  const overviewContentRef = useRef<JSONContent | null>(
    (overviewSection?.content as JSONContent) ?? null
  );
  const buildContentRef = useRef<JSONContent | null>(
    (buildSection?.content as JSONContent) ?? null
  );
  const backstoryContentRef = useRef<JSONContent | null>(
    (backstorySection?.content as JSONContent) ?? null
  );

  // Section save statuses
  const [overviewSaveStatus, setOverviewSaveStatus] =
    useState<SaveStatus>("idle");
  const [buildSaveStatus, setBuildSaveStatus] = useState<SaveStatus>("idle");
  const [backstorySaveStatus, setBackstorySaveStatus] =
    useState<SaveStatus>("idle");

  // Timers for resetting "saved" indicators
  const savedTimerRef = useRef<Record<string, ReturnType<typeof setTimeout>>>(
    {}
  );

  const showSaved = useCallback(
    (
      setter: React.Dispatch<React.SetStateAction<SaveStatus>>,
      key: string
    ) => {
      setter("saved");
      if (savedTimerRef.current[key]) {
        clearTimeout(savedTimerRef.current[key]);
      }
      savedTimerRef.current[key] = setTimeout(() => setter("idle"), 2000);
    },
    []
  );

  // Save profile
  const handleSaveProfile = useCallback(async () => {
    setProfileSaveStatus("saving");
    try {
      await updateCharacterProfile(profile.id, {
        name: name.trim() || profile.name,
        classInfo: classInfo.trim() || null,
        level: level === "" ? null : Number(level),
        portrait,
      });
      showSaved(setProfileSaveStatus, "profile");
    } catch (err) {
      console.error("Failed to save profile:", err);
      setProfileSaveStatus("idle");
    }
  }, [profile.id, profile.name, name, classInfo, level, portrait, showSaved]);

  // Save section
  const handleSaveSection = useCallback(
    async (
      sectionId: string,
      contentRef: React.RefObject<JSONContent | null>,
      setter: React.Dispatch<React.SetStateAction<SaveStatus>>,
      key: string
    ) => {
      setter("saving");
      try {
        await updateCharacterSection(sectionId, contentRef.current);
        showSaved(setter, key);
      } catch (err) {
        console.error("Failed to save section:", err);
        setter("idle");
      }
    },
    [showSaved]
  );

  // Editing state for portrait
  const [editingPortrait, setEditingPortrait] = useState(false);

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <Card>
        <CardContent>
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
                    className="aspect-square"
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
                  className="group relative h-40 w-40 overflow-hidden rounded-lg border border-border transition-colors hover:border-gold/50"
                  onClick={() => setEditingPortrait(true)}
                  title="Click to change portrait"
                >
                  <Image
                    src={`/api/upload/${portrait}`}
                    alt={name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <User className="h-6 w-6 text-gold" />
                  </div>
                </button>
              )}
            </div>

            {/* Fields */}
            <div className="flex flex-1 flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="char-name">Character Name</Label>
                  <Input
                    id="char-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Character name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="char-class">Class / Subclass</Label>
                  <Input
                    id="char-class"
                    value={classInfo}
                    onChange={(e) => setClassInfo(e.target.value)}
                    placeholder="e.g. Paladin / Oath of Vengeance"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="char-level">Level</Label>
                  <Input
                    id="char-level"
                    type="number"
                    min={1}
                    max={20}
                    value={level}
                    onChange={(e) =>
                      setLevel(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    placeholder="Level"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <Button
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
                  <SaveIndicator status={profileSaveStatus} />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Sections */}
      <Tabs defaultValue={0}>
        <TabsList>
          <TabsTrigger value={0}>
            <Swords className="h-4 w-4" />
            Overview / RP
          </TabsTrigger>
          <TabsTrigger value={1}>
            <BookOpen className="h-4 w-4" />
            Build / Progression
          </TabsTrigger>
          <TabsTrigger value={2}>
            <Scroll className="h-4 w-4" />
            Backstory / Lore
          </TabsTrigger>
        </TabsList>

        {/* Overview / RP */}
        <TabsContent value={0}>
          <Card>
            <CardContent className="space-y-4">
              <RichTextEditor
                content={overviewContentRef.current}
                onChange={(content) => {
                  overviewContentRef.current = content;
                }}
                placeholder="RP anchor, tone notes, current mindset..."
              />
              <div className="flex items-center gap-3">
                <Button
                  onClick={() =>
                    overviewSection &&
                    handleSaveSection(
                      overviewSection.id,
                      overviewContentRef,
                      setOverviewSaveStatus,
                      "overview"
                    )
                  }
                  disabled={
                    !overviewSection || overviewSaveStatus === "saving"
                  }
                  variant="outline"
                  className="gap-1.5"
                >
                  {overviewSaveStatus === "saving" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Overview
                </Button>
                <SaveIndicator status={overviewSaveStatus} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Build / Progression */}
        <TabsContent value={1}>
          <Card>
            <CardContent className="space-y-4">
              <RichTextEditor
                content={buildContentRef.current}
                onChange={(content) => {
                  buildContentRef.current = content;
                }}
                placeholder="Class features, build plans, progression notes..."
              />
              <div className="flex items-center gap-3">
                <Button
                  onClick={() =>
                    buildSection &&
                    handleSaveSection(
                      buildSection.id,
                      buildContentRef,
                      setBuildSaveStatus,
                      "build"
                    )
                  }
                  disabled={!buildSection || buildSaveStatus === "saving"}
                  variant="outline"
                  className="gap-1.5"
                >
                  {buildSaveStatus === "saving" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Build
                </Button>
                <SaveIndicator status={buildSaveStatus} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backstory / Lore */}
        <TabsContent value={2}>
          <Card>
            <CardContent className="space-y-4">
              <RichTextEditor
                content={backstoryContentRef.current}
                onChange={(content) => {
                  backstoryContentRef.current = content;
                }}
                placeholder="Character backstory, lore connections, key relationships..."
              />
              <div className="flex items-center gap-3">
                <Button
                  onClick={() =>
                    backstorySection &&
                    handleSaveSection(
                      backstorySection.id,
                      backstoryContentRef,
                      setBackstorySaveStatus,
                      "backstory"
                    )
                  }
                  disabled={
                    !backstorySection || backstorySaveStatus === "saving"
                  }
                  variant="outline"
                  className="gap-1.5"
                >
                  {backstorySaveStatus === "saving" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Backstory
                </Button>
                <SaveIndicator status={backstorySaveStatus} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
