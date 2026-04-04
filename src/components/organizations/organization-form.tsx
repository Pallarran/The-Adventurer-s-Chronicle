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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { RelationPicker, type RelationOption } from "@/components/shared/relation-picker";
import { ImageUpload } from "@/components/shared/image-upload";
import { createOrganization, updateOrganization } from "@/lib/actions/organizations";
import { toast } from "sonner";
import { MapPin, Users } from "lucide-react";
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
  allNpcs: RelationOption[];
}

export function OrganizationForm({
  campaignId,
  organization,
  allLocations,
  allNpcs,
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
  const [selectedNpcs, setSelectedNpcs] = useState<RelationOption[]>(
    organization?.npcs.map((n) => n.npc) ?? []
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

  // ── Mention → picker auto-sync ──
  const suppressedNpcs = useRef(new Set<string>());

  const initializedRef = useRef(false);
  useEffect(() => {
    if (initializedRef.current || !organization?.notesBody) return;
    initializedRef.current = true;
    const mentions = extractMentionsFromContent(organization.notesBody as JSONContent);
    const npcIds = new Set(selectedNpcs.map((n) => n.id));
    for (const m of mentions.npc) if (!npcIds.has(m.id)) suppressedNpcs.current.add(m.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNpcsChange = useCallback((next: RelationOption[]) => {
    const nextIds = new Set(next.map((n) => n.id));
    setSelectedNpcs((prev) => {
      for (const p of prev) if (!nextIds.has(p.id)) suppressedNpcs.current.add(p.id);
      return next;
    });
  }, []);

  const handleNotesChange = useCallback((content: JSONContent) => {
    setNotesBody(content);
    setDirty(true);

    const mentions = extractMentionsFromContent(content);

    setSelectedNpcs((prev) => {
      const ids = new Set(prev.map((n) => n.id));
      const toAdd = mentions.npc.filter((m) => !ids.has(m.id) && !suppressedNpcs.current.has(m.id));
      return toAdd.length ? [...prev, ...toAdd.map((m) => ({ id: m.id, name: m.label }))] : prev;
    });
  }, []);

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
        notesBody: notesBody ?? undefined,
        mainImage: mainImage ?? undefined,
        npcIds: selectedNpcs.map((n) => n.id),
      };

      if (isEdit) {
        await updateOrganization(organization.id, {
          ...data,
          baseLocationId: baseLocation[0]?.id ?? null,
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

      {/* Relations — bordered cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            label={<><Users className="h-4 w-4" /> Known Members</>}
            options={allNpcs}
            selected={selectedNpcs}
            onChange={handleNpcsChange}
            placeholder="Search NPCs..."
          />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label>Notes</Label>
        <RichTextEditor
          content={notesBody}
          onChange={handleNotesChange}
          placeholder="Write notes about this organization..."
        />
      </div>
      </fieldset>
    </form>
  );
}
