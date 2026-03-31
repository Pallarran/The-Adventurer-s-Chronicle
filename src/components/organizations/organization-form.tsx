"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
import { createOrganization, updateOrganization } from "@/lib/actions/organizations";
import { createTag } from "@/lib/actions/tags";
import type { AlignmentStance } from "@/generated/prisma/client";
import type { JSONContent } from "@tiptap/react";
import type { OrganizationDetail } from "@/types";

const STANCE_OPTIONS: { value: AlignmentStance; label: string }[] = [
  { value: "ALLIED", label: "Allied" },
  { value: "FRIENDLY", label: "Friendly" },
  { value: "NEUTRAL", label: "Neutral" },
  { value: "SUSPICIOUS", label: "Suspicious" },
  { value: "HOSTILE", label: "Hostile" },
  { value: "UNKNOWN", label: "Unknown" },
];

interface OrganizationFormProps {
  campaignId: string;
  organization?: OrganizationDetail;
  allLocations: RelationOption[];
  allSessions: RelationOption[];
  allNpcs: RelationOption[];
  allTags: TagOption[];
}

export function OrganizationForm({
  campaignId,
  organization,
  allLocations,
  allSessions,
  allNpcs,
  allTags,
}: OrganizationFormProps) {
  const router = useRouter();
  const isEdit = !!organization;

  const [name, setName] = useState(organization?.name ?? "");
  const [type, setType] = useState(organization?.type ?? "");
  const [alignmentStance, setAlignmentStance] = useState<AlignmentStance>(
    organization?.alignmentStance ?? "UNKNOWN"
  );
  const [baseLocation, setBaseLocation] = useState<RelationOption[]>(
    organization?.baseLocation ? [organization.baseLocation] : []
  );
  const [firstAppearance, setFirstAppearance] = useState<RelationOption[]>(
    organization?.firstAppearanceSession
      ? [
          {
            id: organization.firstAppearanceSession.id,
            name: `#${organization.firstAppearanceSession.sessionNumber}${organization.firstAppearanceSession.title ? ` — ${organization.firstAppearanceSession.title}` : ""}`,
          },
        ]
      : []
  );
  const [lastAppearance, setLastAppearance] = useState<RelationOption[]>(
    organization?.lastAppearanceSession
      ? [
          {
            id: organization.lastAppearanceSession.id,
            name: `#${organization.lastAppearanceSession.sessionNumber}${organization.lastAppearanceSession.title ? ` — ${organization.lastAppearanceSession.title}` : ""}`,
          },
        ]
      : []
  );
  const [selectedNpcs, setSelectedNpcs] = useState<RelationOption[]>(
    organization?.npcs.map((n) => n.npc) ?? []
  );
  const [selectedTags, setSelectedTags] = useState<TagOption[]>(
    organization?.tags.map((t) => t.tag) ?? []
  );
  const [mainImage, setMainImage] = useState<string | null>(
    organization?.mainImage ?? null
  );
  const [notesBody, setNotesBody] = useState<JSONContent | null>(
    (organization?.notesBody as JSONContent) ?? null
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = {
        name,
        type: type || undefined,
        alignmentStance,
        baseLocationId: baseLocation[0]?.id || undefined,
        firstAppearanceSessionId: firstAppearance[0]?.id || undefined,
        lastAppearanceSessionId: lastAppearance[0]?.id || undefined,
        notesBody: notesBody ?? undefined,
        mainImage: mainImage ?? undefined,
        npcIds: selectedNpcs.map((n) => n.id),
        tagIds: selectedTags.map((t) => t.id),
      };

      if (isEdit) {
        await updateOrganization(organization.id, {
          ...data,
          baseLocationId: baseLocation[0]?.id ?? null,
          firstAppearanceSessionId: firstAppearance[0]?.id ?? null,
          lastAppearanceSessionId: lastAppearance[0]?.id ?? null,
          mainImage: mainImage,
        });
        router.push(`/organizations/${organization.id}`);
      } else {
        const newOrg = await createOrganization({ ...data, campaignId });
        router.push(`/organizations/${newOrg.id}`);
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Organization name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Input
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            placeholder="e.g. Guild, Cult, Kingdom..."
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Alignment / Stance</Label>
        <Select value={alignmentStance} onValueChange={(val) => setAlignmentStance(val as AlignmentStance)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STANCE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Main Image</Label>
        <ImageUpload value={mainImage} onChange={setMainImage} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <RelationPicker
          label="Base Location"
          options={allLocations}
          selected={baseLocation}
          onChange={setBaseLocation}
          placeholder="Search locations..."
          single
        />
        <RelationPicker
          label="First Appearance"
          options={allSessions}
          selected={firstAppearance}
          onChange={setFirstAppearance}
          placeholder="Search sessions..."
          single
        />
        <RelationPicker
          label="Last Appearance"
          options={allSessions}
          selected={lastAppearance}
          onChange={setLastAppearance}
          placeholder="Search sessions..."
          single
        />
      </div>

      <RelationPicker
        label="Known Members"
        options={allNpcs}
        selected={selectedNpcs}
        onChange={setSelectedNpcs}
        placeholder="Search NPCs..."
      />

      <TagInput
        availableTags={allTags}
        selectedTags={selectedTags}
        onChange={setSelectedTags}
        onCreateTag={handleCreateTag}
      />

      <div className="space-y-2">
        <Label>Notes</Label>
        <RichTextEditor
          content={notesBody}
          onChange={setNotesBody}
          placeholder="Write notes about this organization..."
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Organization"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
