"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormGuard } from "@/hooks/use-form-guard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { RelationPicker, type RelationOption } from "@/components/shared/relation-picker";
import { TagInput, type TagOption } from "@/components/shared/tag-input";
import { ImageUpload } from "@/components/shared/image-upload";
import { createLocation, updateLocation } from "@/lib/actions/locations";
import { createTag } from "@/lib/actions/tags";
import { toast } from "sonner";
import { MapPin, CalendarDays, Shield, Tag } from "lucide-react";
import type { JSONContent } from "@tiptap/react";
import type { LocationDetail } from "@/types";

export function LocationFormActions({ isEdit }: { isEdit: boolean }) {
  const router = useRouter();
  return (
    <>
      <Button type="submit" form="location-form">
        {isEdit ? "Save Changes" : "Create Location"}
      </Button>
      <Button type="button" variant="outline" onClick={() => router.back()}>
        Cancel
      </Button>
    </>
  );
}

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
  const [dirty, setDirty] = useState(false);
  useFormGuard(dirty);

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
        toast.success("Location updated.");
        router.push(`/locations/${location.id}`);
      } else {
        const newLocation = await createLocation({ ...data, campaignId });
        toast.success("Location created.");
        router.push(`/locations/${newLocation.id}`);
      }
    } catch {
      toast.error("Failed to save location.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateTag = async (tagName: string): Promise<TagOption> => {
    const tag = await createTag(campaignId, tagName);
    return { id: tag.id, name: tag.name };
  };

  return (
    <form id="location-form" onSubmit={handleSubmit} onChange={() => setDirty(true)} className="space-y-6">
      <fieldset disabled={saving} className="space-y-6">
      {/* Identity — image left, fields right */}
      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="w-full space-y-2 sm:w-48 sm:shrink-0">
          <Label>Image</Label>
          <ImageUpload value={mainImage} onChange={setMainImage} className="aspect-[4/3]" />
        </div>
        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="min-w-[200px] flex-1 space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Location name"
                required
              />
            </div>
            <div className="w-48 space-y-2">
              <Label htmlFor="type">Type</Label>
              <Input
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                placeholder="e.g. City, Dungeon, Tavern"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Relations + Tags — bordered cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-lg border border-border p-4">
          <RelationPicker
            label={<><MapPin className="h-4 w-4" /> Parent Location</>}
            options={parentOptions}
            selected={selectedParent}
            onChange={setSelectedParent}
            placeholder="Search locations..."
            single
          />
        </div>
        <div className="rounded-lg border border-border p-4">
          <RelationPicker
            label={<><CalendarDays className="h-4 w-4" /> First Appearance</>}
            options={allSessions}
            selected={selectedFirstAppearance}
            onChange={setSelectedFirstAppearance}
            placeholder="Search sessions..."
            single
          />
        </div>
        <div className="rounded-lg border border-border p-4">
          <RelationPicker
            label={<><CalendarDays className="h-4 w-4" /> Last Appearance</>}
            options={allSessions}
            selected={selectedLastAppearance}
            onChange={setSelectedLastAppearance}
            placeholder="Search sessions..."
            single
          />
        </div>
        <div className="rounded-lg border border-border p-4">
          <RelationPicker
            label={<><Shield className="h-4 w-4" /> Organizations</>}
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

      {/* Notes */}
      <div className="space-y-2">
        <Label>Notes</Label>
        <RichTextEditor
          content={notesBody}
          onChange={(c) => { setNotesBody(c); setDirty(true); }}
          placeholder="Write notes about this location..."
        />
      </div>
      </fieldset>
    </form>
  );
}
