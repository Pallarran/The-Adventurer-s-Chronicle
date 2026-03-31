"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { RelationPicker, type RelationOption } from "@/components/shared/relation-picker";
import { TagInput, type TagOption } from "@/components/shared/tag-input";
import { ImageUpload } from "@/components/shared/image-upload";
import { createLocation, updateLocation } from "@/lib/actions/locations";
import { createTag } from "@/lib/actions/tags";
import type { JSONContent } from "@tiptap/react";
import type { LocationDetail } from "@/types";

interface LocationFormProps {
  campaignId: string;
  location?: LocationDetail;
  allLocations: RelationOption[];
  allSessions: RelationOption[];
  allOrganizations: RelationOption[];
  allTags: TagOption[];
}

export function LocationForm({
  campaignId,
  location,
  allLocations,
  allSessions,
  allOrganizations,
  allTags,
}: LocationFormProps) {
  const router = useRouter();
  const isEdit = !!location;

  const [name, setName] = useState(location?.name ?? "");
  const [type, setType] = useState(location?.type ?? "");
  const [mainImage, setMainImage] = useState<string | null>(location?.mainImage ?? null);
  const [notesBody, setNotesBody] = useState<JSONContent | null>(
    (location?.notesBody as JSONContent) ?? null
  );
  const [selectedParent, setSelectedParent] = useState<RelationOption[]>(
    location?.parentLocation ? [location.parentLocation] : []
  );
  const [selectedFirstAppearance, setSelectedFirstAppearance] = useState<RelationOption[]>(
    location?.firstAppearanceSession
      ? [
          {
            id: location.firstAppearanceSession.id,
            name: `#${location.firstAppearanceSession.sessionNumber}${location.firstAppearanceSession.title ? ` — ${location.firstAppearanceSession.title}` : ""}`,
          },
        ]
      : []
  );
  const [selectedLastAppearance, setSelectedLastAppearance] = useState<RelationOption[]>(
    location?.lastAppearanceSession
      ? [
          {
            id: location.lastAppearanceSession.id,
            name: `#${location.lastAppearanceSession.sessionNumber}${location.lastAppearanceSession.title ? ` — ${location.lastAppearanceSession.title}` : ""}`,
          },
        ]
      : []
  );
  const [selectedOrgs, setSelectedOrgs] = useState<RelationOption[]>(
    location?.organizations.map((o) => o.organization) ?? []
  );
  const [selectedTags, setSelectedTags] = useState<TagOption[]>(
    location?.tags.map((t) => t.tag) ?? []
  );
  const [saving, setSaving] = useState(false);

  // Filter out the current location from the parent options to prevent self-reference
  const parentOptions = allLocations.filter((l) => l.id !== location?.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = {
        name,
        type: type || undefined,
        mainImage: mainImage ?? undefined,
        notesBody: notesBody ?? undefined,
        parentLocationId: selectedParent[0]?.id || undefined,
        firstAppearanceSessionId: selectedFirstAppearance[0]?.id || undefined,
        lastAppearanceSessionId: selectedLastAppearance[0]?.id || undefined,
        organizationIds: selectedOrgs.map((o) => o.id),
        tagIds: selectedTags.map((t) => t.id),
      };

      if (isEdit) {
        await updateLocation(location.id, {
          ...data,
          parentLocationId: selectedParent[0]?.id ?? null,
          firstAppearanceSessionId: selectedFirstAppearance[0]?.id ?? null,
          lastAppearanceSessionId: selectedLastAppearance[0]?.id ?? null,
          mainImage: mainImage,
        });
        router.push(`/locations/${location.id}`);
      } else {
        const newLocation = await createLocation({ ...data, campaignId });
        router.push(`/locations/${newLocation.id}`);
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
            placeholder="Location name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Input
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            placeholder="e.g. City, Dungeon, Tavern, Forest"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Image</Label>
        <ImageUpload value={mainImage} onChange={setMainImage} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <RelationPicker
          label="Parent Location"
          options={parentOptions}
          selected={selectedParent}
          onChange={setSelectedParent}
          placeholder="Search locations..."
          single
        />
        <RelationPicker
          label="First Appearance"
          options={allSessions}
          selected={selectedFirstAppearance}
          onChange={setSelectedFirstAppearance}
          placeholder="Search sessions..."
          single
        />
        <RelationPicker
          label="Last Appearance"
          options={allSessions}
          selected={selectedLastAppearance}
          onChange={setSelectedLastAppearance}
          placeholder="Search sessions..."
          single
        />
      </div>

      <RelationPicker
        label="Associated Organizations"
        options={allOrganizations}
        selected={selectedOrgs}
        onChange={setSelectedOrgs}
        placeholder="Search organizations..."
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
          placeholder="Write notes about this location..."
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Location"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
