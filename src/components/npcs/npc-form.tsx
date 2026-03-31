"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { RelationPicker, type RelationOption } from "@/components/shared/relation-picker";
import { TagInput, type TagOption } from "@/components/shared/tag-input";
import { ImageUpload } from "@/components/shared/image-upload";
import { createNpc, updateNpc } from "@/lib/actions/npcs";
import { createTag } from "@/lib/actions/tags";
import type { JSONContent } from "@tiptap/react";
import type { NpcStatus } from "@/generated/prisma/client";
import type { NpcDetail } from "@/types";

const NPC_STATUSES: NpcStatus[] = ["ALIVE", "DEAD", "MISSING", "UNKNOWN"];

interface NpcFormProps {
  campaignId: string;
  npc?: NpcDetail;
  allOrganizations: RelationOption[];
  allSessions: RelationOption[];
  allTags: TagOption[];
}

export function NpcForm({
  campaignId,
  npc,
  allOrganizations,
  allSessions,
  allTags,
}: NpcFormProps) {
  const router = useRouter();
  const isEdit = !!npc;

  const [name, setName] = useState(npc?.name ?? "");
  const [aliasTitle, setAliasTitle] = useState(npc?.aliasTitle ?? "");
  const [gender, setGender] = useState(npc?.gender ?? "");
  const [classRole, setClassRole] = useState(npc?.classRole ?? "");
  const [status, setStatus] = useState<NpcStatus>(npc?.status ?? "ALIVE");
  const [partyMember, setPartyMember] = useState(npc?.partyMember ?? false);
  const [mainImage, setMainImage] = useState<string | null>(npc?.mainImage ?? null);
  const [notesBody, setNotesBody] = useState<JSONContent | null>(
    (npc?.notesBody as JSONContent) ?? null
  );
  const [selectedOrg, setSelectedOrg] = useState<RelationOption[]>(
    npc?.organization ? [npc.organization] : []
  );
  const [selectedFirstSession, setSelectedFirstSession] = useState<RelationOption[]>(
    npc?.firstAppearanceSession
      ? [
          {
            id: npc.firstAppearanceSession.id,
            name: `Session #${npc.firstAppearanceSession.sessionNumber}`,
          },
        ]
      : []
  );
  const [selectedLastSession, setSelectedLastSession] = useState<RelationOption[]>(
    npc?.lastAppearanceSession
      ? [
          {
            id: npc.lastAppearanceSession.id,
            name: `Session #${npc.lastAppearanceSession.sessionNumber}`,
          },
        ]
      : []
  );
  const [selectedTags, setSelectedTags] = useState<TagOption[]>(
    npc?.tags.map((t) => t.tag) ?? []
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = {
        name,
        aliasTitle: aliasTitle || undefined,
        gender: gender || undefined,
        classRole: classRole || undefined,
        status,
        partyMember,
        organizationId: selectedOrg[0]?.id || undefined,
        firstAppearanceSessionId: selectedFirstSession[0]?.id || undefined,
        lastAppearanceSessionId: selectedLastSession[0]?.id || undefined,
        notesBody: notesBody ?? undefined,
        mainImage: mainImage ?? undefined,
        tagIds: selectedTags.map((t) => t.id),
      };

      if (isEdit) {
        await updateNpc(npc.id, {
          ...data,
          organizationId: data.organizationId ?? null,
          firstAppearanceSessionId: data.firstAppearanceSessionId ?? null,
          lastAppearanceSessionId: data.lastAppearanceSessionId ?? null,
          mainImage: mainImage,
        });
        router.push(`/npcs/${npc.id}`);
      } else {
        const newNpc = await createNpc({ ...data, campaignId });
        router.push(`/npcs/${newNpc.id}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCreateTag = async (tagName: string): Promise<TagOption> => {
    const tag = await createTag(campaignId, tagName);
    return { id: tag.id, name: tag.name };
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name and Alias */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="NPC name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="aliasTitle">Alias / Title</Label>
          <Input
            id="aliasTitle"
            value={aliasTitle}
            onChange={(e) => setAliasTitle(e.target.value)}
            placeholder='e.g. "The Shadow Broker"'
          />
        </div>
      </div>

      {/* Gender, Class/Role, Status */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Input
            id="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            placeholder="e.g. Male, Female, Non-binary"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="classRole">Class / Role</Label>
          <Input
            id="classRole"
            value={classRole}
            onChange={(e) => setClassRole(e.target.value)}
            placeholder="e.g. Wizard, Merchant, Guard"
          />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={(val) => setStatus(val as NpcStatus)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {NPC_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Party Member */}
      <div className="flex items-center gap-3">
        <Switch
          checked={partyMember}
          onCheckedChange={setPartyMember}
          id="partyMember"
        />
        <Label htmlFor="partyMember">Party Member</Label>
      </div>

      {/* Portrait Image */}
      <div className="space-y-2">
        <Label>Portrait Image</Label>
        <ImageUpload value={mainImage} onChange={setMainImage} />
      </div>

      {/* Organization */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <RelationPicker
          label="Organization"
          options={allOrganizations}
          selected={selectedOrg}
          onChange={setSelectedOrg}
          placeholder="Search organizations..."
          single
        />
        <RelationPicker
          label="First Appearance"
          options={allSessions}
          selected={selectedFirstSession}
          onChange={setSelectedFirstSession}
          placeholder="Search sessions..."
          single
        />
        <RelationPicker
          label="Last Appearance"
          options={allSessions}
          selected={selectedLastSession}
          onChange={setSelectedLastSession}
          placeholder="Search sessions..."
          single
        />
      </div>

      {/* Tags */}
      <TagInput
        availableTags={allTags}
        selectedTags={selectedTags}
        onChange={setSelectedTags}
        onCreateTag={handleCreateTag}
      />

      {/* Notes */}
      <div className="space-y-2">
        <Label>Notes</Label>
        <RichTextEditor
          content={notesBody}
          onChange={setNotesBody}
          placeholder="Write notes about this NPC..."
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Create NPC"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
