"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useFormGuard } from "@/hooks/use-form-guard";
import { extractMentionsFromContent } from "@/lib/extract-mentions";
import { Input } from "@/components/ui/input";
import { ComboboxInput } from "@/components/shared/combobox-input";
import { getFormOptions, updateFormOptions } from "@/lib/actions/form-options";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { RelationPicker, type RelationOption } from "@/components/shared/relation-picker";
import { TagInput, type TagOption } from "@/components/shared/tag-input";
import { ImageUpload } from "@/components/shared/image-upload";
import { createLocation, updateLocation } from "@/lib/actions/locations";
import { createTag } from "@/lib/actions/tags";
import { toast } from "sonner";
import { MapPin, Shield, Tag } from "lucide-react";
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
  allOrganizations: RelationOption[];
  allTags: TagOption[];
}

export function LocationForm({
  campaignId,
  location,
  allLocations,
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
  const [selectedOrgs, setSelectedOrgs] = useState<RelationOption[]>(
    location?.organizations.map((o) => o.organization) ?? []
  );
  const [selectedTags, setSelectedTags] = useState<TagOption[]>(
    location?.tags.map((t) => t.tag) ?? []
  );
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  useFormGuard(dirty);

  // ── Mention → picker auto-sync ──
  const suppressedOrgs = useRef(new Set<string>());

  const initializedRef = useRef(false);
  useEffect(() => {
    if (initializedRef.current || !location?.notesBody) return;
    initializedRef.current = true;
    const mentions = extractMentionsFromContent(location.notesBody as JSONContent);
    const orgIds = new Set(selectedOrgs.map((o) => o.id));
    for (const m of mentions.organization) if (!orgIds.has(m.id)) suppressedOrgs.current.add(m.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOrgsChange = useCallback((next: RelationOption[]) => {
    const nextIds = new Set(next.map((o) => o.id));
    setSelectedOrgs((prev) => {
      for (const p of prev) if (!nextIds.has(p.id)) suppressedOrgs.current.add(p.id);
      return next;
    });
  }, []);

  const handleNotesChange = useCallback((content: JSONContent) => {
    setNotesBody(content);
    setDirty(true);

    const mentions = extractMentionsFromContent(content);

    setSelectedOrgs((prev) => {
      const ids = new Set(prev.map((o) => o.id));
      const toAdd = mentions.organization.filter((m) => !ids.has(m.id) && !suppressedOrgs.current.has(m.id));
      return toAdd.length ? [...prev, ...toAdd.map((m) => ({ id: m.id, name: m.label }))] : prev;
    });
  }, []);

  // Combobox option list (per-campaign)
  const [typeOptions, setTypeOptions] = useState<string[]>([]);

  useEffect(() => {
    getFormOptions("locationType").then(setTypeOptions);
  }, []);

  const handleAddType = useCallback((opt: string) => {
    setTypeOptions((prev) => {
      const next = [...prev, opt];
      updateFormOptions("locationType", next);
      return next;
    });
  }, []);

  const handleRemoveType = useCallback((opt: string) => {
    setTypeOptions((prev) => {
      const next = prev.filter((o) => o !== opt);
      updateFormOptions("locationType", next);
      return next;
    });
  }, []);

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
        organizationIds: selectedOrgs.map((o) => o.id),
        tagIds: selectedTags.map((t) => t.id),
      };

      if (isEdit) {
        await updateLocation(location.id, {
          ...data,
          parentLocationId: selectedParent[0]?.id ?? null,
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
              <Label>Type</Label>
              <ComboboxInput
                value={type}
                onChange={setType}
                options={typeOptions}
                onAddOption={handleAddType}
                onRemoveOption={handleRemoveType}
                placeholder="e.g. City, Dungeon"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Relations + Tags — bordered cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            label={<><Shield className="h-4 w-4" /> Organizations</>}
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

      {/* Notes */}
      <div className="space-y-2">
        <Label>Notes</Label>
        <RichTextEditor
          content={notesBody}
          onChange={handleNotesChange}
          placeholder="Write notes about this location..."
        />
      </div>
      </fieldset>
    </form>
  );
}
