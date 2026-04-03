"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useFormGuard } from "@/hooks/use-form-guard";
import { Input } from "@/components/ui/input";
import { ComboboxInput } from "@/components/shared/combobox-input";
import { getFormOptions, updateFormOptions } from "@/lib/actions/form-options";
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
import { toast } from "sonner";
import { MapPin, CalendarDays, Users, Tag } from "lucide-react";
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

export function OrganizationFormActions({ isEdit }: { isEdit: boolean }) {
  const router = useRouter();
  return (
    <>
      <Button type="submit" form="organization-form">
        {isEdit ? "Save Changes" : "Create Organization"}
      </Button>
      <Button type="button" variant="outline" onClick={() => router.back()}>
        Cancel
      </Button>
    </>
  );
}

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
  const [dirty, setDirty] = useState(false);
  useFormGuard(dirty);

  // Combobox option list (per-campaign)
  const [typeOptions, setTypeOptions] = useState<string[]>([]);

  useEffect(() => {
    getFormOptions("organizationType").then(setTypeOptions);
  }, []);

  const handleAddType = useCallback((opt: string) => {
    setTypeOptions((prev) => {
      const next = [...prev, opt];
      updateFormOptions("organizationType", next);
      return next;
    });
  }, []);

  const handleRemoveType = useCallback((opt: string) => {
    setTypeOptions((prev) => {
      const next = prev.filter((o) => o !== opt);
      updateFormOptions("organizationType", next);
      return next;
    });
  }, []);

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
        toast.success("Organization updated.");
        router.push(`/organizations/${organization.id}`);
      } else {
        const newOrg = await createOrganization({ ...data, campaignId });
        toast.success("Organization created.");
        router.push(`/organizations/${newOrg.id}`);
      }
    } catch {
      toast.error("Failed to save organization.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateTag = async (tagName: string): Promise<TagOption> => {
    const tag = await createTag(campaignId, tagName);
    return { id: tag.id, name: tag.name };
  };

  return (
    <form id="organization-form" onSubmit={handleSubmit} onChange={() => setDirty(true)} className="space-y-6">
      <fieldset disabled={saving} className="space-y-6">
      {/* Identity — image left, fields right */}
      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="w-full space-y-2 sm:w-48 sm:shrink-0">
          <Label>Image</Label>
          <ImageUpload value={mainImage} onChange={setMainImage} className="aspect-[4/3]" />
        </div>
        <div className="flex-1 space-y-4">
          {/* Row 1: Name + Type */}
          <div className="flex flex-wrap items-end gap-4">
            <div className="min-w-[200px] flex-1 space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Organization name"
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
                placeholder="e.g. Guild, Kingdom"
              />
            </div>
          </div>

          {/* Row 2: Alignment/Stance */}
          <div className="w-44 space-y-2">
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
        </div>
      </div>

      {/* Relations + Tags — bordered cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-lg border border-border p-4">
          <RelationPicker
            label={<><MapPin className="h-4 w-4" /> Base Location</>}
            options={allLocations}
            selected={baseLocation}
            onChange={setBaseLocation}
            placeholder="Search locations..."
            single
          />
        </div>
        <div className="rounded-lg border border-border p-4">
          <RelationPicker
            label={<><CalendarDays className="h-4 w-4" /> First Appearance</>}
            options={allSessions}
            selected={firstAppearance}
            onChange={setFirstAppearance}
            placeholder="Search sessions..."
            single
          />
        </div>
        <div className="rounded-lg border border-border p-4">
          <RelationPicker
            label={<><CalendarDays className="h-4 w-4" /> Last Appearance</>}
            options={allSessions}
            selected={lastAppearance}
            onChange={setLastAppearance}
            placeholder="Search sessions..."
            single
          />
        </div>
        <div className="rounded-lg border border-border p-4">
          <RelationPicker
            label={<><Users className="h-4 w-4" /> Known Members</>}
            options={allNpcs}
            selected={selectedNpcs}
            onChange={setSelectedNpcs}
            placeholder="Search NPCs..."
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
          placeholder="Write notes about this organization..."
        />
      </div>
      </fieldset>
    </form>
  );
}
