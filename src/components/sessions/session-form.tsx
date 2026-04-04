"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useFormGuard } from "@/hooks/use-form-guard";
import { extractMentionsFromContent } from "@/lib/extract-mentions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { RelationPicker, type RelationOption } from "@/components/shared/relation-picker";
import { TagInput, type TagOption } from "@/components/shared/tag-input";
import { SessionQuestList } from "@/components/sessions/session-quest-list";
import { createSession, updateSession } from "@/lib/actions/sessions";
import { createTag } from "@/lib/actions/tags";
import { toast } from "sonner";
import { Users, MapPin, Shield, Tag } from "lucide-react";
import type { JSONContent } from "@tiptap/react";
import type { SessionDetail } from "@/types";

export function SessionFormActions({ isEdit }: { isEdit: boolean }) {
  const router = useRouter();
  return (
    <>
      <Button type="submit" form="session-form">
        {isEdit ? "Save Changes" : "Create Session"}
      </Button>
      <Button type="button" variant="outline" onClick={() => router.back()}>
        Cancel
      </Button>
    </>
  );
}

interface SessionFormProps {
  campaignId: string;
  session?: SessionDetail;
  defaultSessionNumber?: number;
  allNpcs: RelationOption[];
  allLocations: RelationOption[];
  allOrganizations: RelationOption[];
  allTags: TagOption[];
}

export function SessionForm({
  campaignId,
  session,
  defaultSessionNumber,
  allNpcs,
  allLocations,
  allOrganizations,
  allTags,
}: SessionFormProps) {
  const router = useRouter();
  const isEdit = !!session;

  const [sessionNumber, setSessionNumber] = useState(session?.sessionNumber ?? defaultSessionNumber ?? 1);
  const [title, setTitle] = useState(session?.title ?? "");
  const [realDatePlayed, setRealDatePlayed] = useState(
    session ? new Date(session.realDatePlayed).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]
  );
  const [inGameDate, setInGameDate] = useState(session?.inGameDate ?? "");
  const [notesBody, setNotesBody] = useState<JSONContent | null>(
    (session?.notesBody as JSONContent) ?? null
  );
  const [selectedNpcs, setSelectedNpcs] = useState<RelationOption[]>(
    session?.npcs.map((n) => n.npc) ?? []
  );
  const [selectedLocations, setSelectedLocations] = useState<RelationOption[]>(
    session?.locations.map((l) => l.location) ?? []
  );
  const [selectedOrgs, setSelectedOrgs] = useState<RelationOption[]>(
    session?.organizations.map((o) => o.organization) ?? []
  );
  const [questIds, setQuestIds] = useState<string[]>(
    session?.quests.map((q) => q.quest.id) ?? []
  );
  const [selectedTags, setSelectedTags] = useState<TagOption[]>(
    session?.tags.map((t) => t.tag) ?? []
  );
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  useFormGuard(dirty);

  // ── Mention → picker auto-sync ──
  const suppressedNpcs = useRef(new Set<string>());
  const suppressedLocations = useRef(new Set<string>());
  const suppressedOrgs = useRef(new Set<string>());

  // Seed suppressed sets in edit mode: mentions already in notes but NOT in
  // the featured list were intentionally excluded by the user previously.
  const initializedRef = useRef(false);
  useEffect(() => {
    if (initializedRef.current || !session?.notesBody) return;
    initializedRef.current = true;
    const mentions = extractMentionsFromContent(session.notesBody as JSONContent);
    const npcIds = new Set(selectedNpcs.map((n) => n.id));
    const locIds = new Set(selectedLocations.map((l) => l.id));
    const orgIds = new Set(selectedOrgs.map((o) => o.id));
    for (const m of mentions.npc) if (!npcIds.has(m.id)) suppressedNpcs.current.add(m.id);
    for (const m of mentions.location) if (!locIds.has(m.id)) suppressedLocations.current.add(m.id);
    for (const m of mentions.organization) if (!orgIds.has(m.id)) suppressedOrgs.current.add(m.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Wrap picker onChange to track manual removals in suppressed sets
  const handleNpcsChange = useCallback((next: RelationOption[]) => {
    const nextIds = new Set(next.map((n) => n.id));
    setSelectedNpcs((prev) => {
      for (const p of prev) if (!nextIds.has(p.id)) suppressedNpcs.current.add(p.id);
      return next;
    });
  }, []);

  const handleLocationsChange = useCallback((next: RelationOption[]) => {
    const nextIds = new Set(next.map((l) => l.id));
    setSelectedLocations((prev) => {
      for (const p of prev) if (!nextIds.has(p.id)) suppressedLocations.current.add(p.id);
      return next;
    });
  }, []);

  const handleOrgsChange = useCallback((next: RelationOption[]) => {
    const nextIds = new Set(next.map((o) => o.id));
    setSelectedOrgs((prev) => {
      for (const p of prev) if (!nextIds.has(p.id)) suppressedOrgs.current.add(p.id);
      return next;
    });
  }, []);

  // Sync mentions from editor content into relation pickers
  const handleNotesChange = useCallback((content: JSONContent) => {
    setNotesBody(content);
    setDirty(true);

    const mentions = extractMentionsFromContent(content);

    setSelectedNpcs((prev) => {
      const ids = new Set(prev.map((n) => n.id));
      const toAdd = mentions.npc.filter((m) => !ids.has(m.id) && !suppressedNpcs.current.has(m.id));
      return toAdd.length ? [...prev, ...toAdd.map((m) => ({ id: m.id, name: m.label }))] : prev;
    });

    setSelectedLocations((prev) => {
      const ids = new Set(prev.map((l) => l.id));
      const toAdd = mentions.location.filter((m) => !ids.has(m.id) && !suppressedLocations.current.has(m.id));
      return toAdd.length ? [...prev, ...toAdd.map((m) => ({ id: m.id, name: m.label }))] : prev;
    });

    setSelectedOrgs((prev) => {
      const ids = new Set(prev.map((o) => o.id));
      const toAdd = mentions.organization.filter((m) => !ids.has(m.id) && !suppressedOrgs.current.has(m.id));
      return toAdd.length ? [...prev, ...toAdd.map((m) => ({ id: m.id, name: m.label }))] : prev;
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = {
        sessionNumber,
        title: title || undefined,
        realDatePlayed: new Date(realDatePlayed),
        inGameDate: inGameDate || undefined,
        notesBody: notesBody ?? undefined,
        npcIds: selectedNpcs.map((n) => n.id),
        locationIds: selectedLocations.map((l) => l.id),
        organizationIds: selectedOrgs.map((o) => o.id),
        questIds,
        tagIds: selectedTags.map((t) => t.id),
      };

      if (isEdit) {
        await updateSession(session.id, data);
        toast.success("Session updated.");
        router.push(`/sessions/${session.id}`);
      } else {
        const newSession = await createSession({ ...data, campaignId });
        toast.success("Session created.");
        router.push(`/sessions/${newSession.id}`);
      }
    } catch {
      toast.error("Failed to save session.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateTag = async (name: string): Promise<TagOption> => {
    const tag = await createTag(campaignId, name);
    return { id: tag.id, name: tag.name };
  };

  return (
    <form id="session-form" onSubmit={handleSubmit} onChange={() => setDirty(true)} className="space-y-6">
      <fieldset disabled={saving} className="space-y-6">
      {/* Title + compact metadata row */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-[200px] flex-1 space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Session title (optional)"
          />
        </div>
        <div className="w-24 space-y-2">
          <Label htmlFor="sessionNumber">Session # *</Label>
          <Input
            id="sessionNumber"
            type="number"
            value={sessionNumber}
            onChange={(e) => setSessionNumber(Number(e.target.value))}
            required
          />
        </div>
        <div className="w-44 space-y-2">
          <Label htmlFor="realDatePlayed">Date Played *</Label>
          <Input
            id="realDatePlayed"
            type="date"
            value={realDatePlayed}
            onChange={(e) => setRealDatePlayed(e.target.value)}
            required
            className="date-input-gold"
          />
        </div>
        <div className="w-88 space-y-2">
          <Label htmlFor="inGameDate">In-Game Date</Label>
          <Input
            id="inGameDate"
            value={inGameDate}
            onChange={(e) => setInGameDate(e.target.value)}
            placeholder="e.g. 15th of Mirtul"
          />
        </div>
      </div>

      {/* Relations + Tags — bordered cards in single row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border p-4">
          <RelationPicker
            label={<><Users className="h-4 w-4" /> Featured NPCs</>}
            options={allNpcs}
            selected={selectedNpcs}
            onChange={handleNpcsChange}
            placeholder="Search NPCs..."
          />
        </div>
        <div className="rounded-lg border border-border p-4">
          <RelationPicker
            label={<><MapPin className="h-4 w-4" /> Featured Locations</>}
            options={allLocations}
            selected={selectedLocations}
            onChange={handleLocationsChange}
            placeholder="Search locations..."
          />
        </div>
        <div className="rounded-lg border border-border p-4">
          <RelationPicker
            label={<><Shield className="h-4 w-4" /> Featured Organizations</>}
            options={allOrganizations}
            selected={selectedOrgs}
            onChange={handleOrgsChange}
            placeholder="Search organizations..."
          />
        </div>
        <div className="rounded-lg border border-border p-4">
          <TagInput
            label={<><Tag className="h-4 w-4" /> Tags</>}
            availableTags={allTags}
            selectedTags={selectedTags}
            onChange={setSelectedTags}
            onCreateTag={handleCreateTag}
          />
        </div>
      </div>

      {/* Session Notes */}
      <div className="space-y-2">
        <Label>Session Notes</Label>
        <RichTextEditor
          content={notesBody}
          onChange={handleNotesChange}
          placeholder="Write your session notes..."
        />
      </div>

      {/* Quests & Goals — inline creation list */}
      <SessionQuestList
        initialQuests={
          session?.quests.map((q) => ({
            id: q.quest.id,
            name: q.quest.name,
            status: q.quest.status,
            description: q.quest.description,
            persisted: true,
          })) ?? []
        }
        campaignId={campaignId}
        onQuestsChange={setQuestIds}
        disabled={saving}
      />

      </fieldset>
    </form>
  );
}
