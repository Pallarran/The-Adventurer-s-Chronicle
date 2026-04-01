"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { RelationPicker, type RelationOption } from "@/components/shared/relation-picker";
import { TagInput, type TagOption } from "@/components/shared/tag-input";
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
  const [followUpActions, setFollowUpActions] = useState<JSONContent | null>(
    (session?.followUpActions as JSONContent) ?? null
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
  const [selectedTags, setSelectedTags] = useState<TagOption[]>(
    session?.tags.map((t) => t.tag) ?? []
  );
  const [saving, setSaving] = useState(false);

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
        followUpActions: followUpActions ?? undefined,
        npcIds: selectedNpcs.map((n) => n.id),
        locationIds: selectedLocations.map((l) => l.id),
        organizationIds: selectedOrgs.map((o) => o.id),
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
    <form id="session-form" onSubmit={handleSubmit} className="space-y-6">
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
          <Label htmlFor="sessionNumber">Session #</Label>
          <Input
            id="sessionNumber"
            type="number"
            value={sessionNumber}
            onChange={(e) => setSessionNumber(Number(e.target.value))}
            required
          />
        </div>
        <div className="w-44 space-y-2">
          <Label htmlFor="realDatePlayed">Date Played</Label>
          <Input
            id="realDatePlayed"
            type="date"
            value={realDatePlayed}
            onChange={(e) => setRealDatePlayed(e.target.value)}
            required
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
            onChange={setSelectedNpcs}
            placeholder="Search NPCs..."
          />
        </div>
        <div className="rounded-lg border border-border p-4">
          <RelationPicker
            label={<><MapPin className="h-4 w-4" /> Featured Locations</>}
            options={allLocations}
            selected={selectedLocations}
            onChange={setSelectedLocations}
            placeholder="Search locations..."
          />
        </div>
        <div className="rounded-lg border border-border p-4">
          <RelationPicker
            label={<><Shield className="h-4 w-4" /> Featured Organizations</>}
            options={allOrganizations}
            selected={selectedOrgs}
            onChange={setSelectedOrgs}
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
          onChange={setNotesBody}
          placeholder="Write your session notes..."
        />
      </div>

      {/* Follow-Up Actions */}
      <div className="space-y-2">
        <Label>Follow-Up Actions</Label>
        <RichTextEditor
          content={followUpActions}
          onChange={setFollowUpActions}
          placeholder="Things to remember for next session..."
        />
      </div>
      </fieldset>
    </form>
  );
}
