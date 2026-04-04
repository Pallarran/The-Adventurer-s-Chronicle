"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useFormGuard } from "@/hooks/use-form-guard";
import { extractMentionsFromContent } from "@/lib/extract-mentions";
import { Input } from "@/components/ui/input";
import { ComboboxInput } from "@/components/shared/combobox-input";
import { getFormOptions, updateFormOptions } from "@/lib/actions/form-options";
import type { FormOptionCategory } from "@/lib/constants/form-options";
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
import { ImageUpload } from "@/components/shared/image-upload";
import { createNpc, updateNpc } from "@/lib/actions/npcs";
import { toast } from "sonner";
import { Shield } from "lucide-react";
import type { JSONContent } from "@tiptap/react";
import type { NpcStatus, AlignmentStance } from "@/generated/prisma/client";
import type { NpcDetail } from "@/types";

const NPC_STATUSES: NpcStatus[] = ["ALIVE", "DEAD", "MISSING", "UNKNOWN"];

const STANCE_OPTIONS: { value: AlignmentStance; label: string }[] = [
  { value: "ALLIED", label: "Allied" },
  { value: "FRIENDLY", label: "Friendly" },
  { value: "NEUTRAL", label: "Neutral" },
  { value: "SUSPICIOUS", label: "Suspicious" },
  { value: "HOSTILE", label: "Hostile" },
  { value: "UNKNOWN", label: "Unknown" },
];

export function NpcFormActions({ isEdit }: { isEdit: boolean }) {
  const router = useRouter();
  return (
    <>
      <Button type="submit" form="npc-form">
        {isEdit ? "Save Changes" : "Create NPC"}
      </Button>
      <Button type="button" variant="outline" onClick={() => router.back()}>
        Cancel
      </Button>
    </>
  );
}

interface NpcFormProps {
  campaignId: string;
  npc?: NpcDetail;
  allOrganizations: RelationOption[];
}

export function NpcForm({
  campaignId,
  npc,
  allOrganizations,
}: NpcFormProps) {
  const router = useRouter();
  const isEdit = !!npc;

  const [name, setName] = useState(npc?.name ?? "");
  const [aliasTitle, setAliasTitle] = useState(npc?.aliasTitle ?? "");
  const [gender, setGender] = useState(npc?.gender ?? "");
  const [classRole, setClassRole] = useState(npc?.classRole ?? "");
  const [race, setRace] = useState(npc?.race ?? "");
  const [status, setStatus] = useState<NpcStatus>(npc?.status ?? "ALIVE");
  const [alignmentStance, setAlignmentStance] = useState<AlignmentStance>(npc?.alignmentStance ?? "UNKNOWN");
  const [partyMember, setPartyMember] = useState(npc?.partyMember ?? false);
  const [mainImage, setMainImage] = useState<string | null>(npc?.mainImage ?? null);
  const [notesBody, setNotesBody] = useState<JSONContent | null>(
    (npc?.notesBody as JSONContent) ?? null
  );
  const [selectedOrg, setSelectedOrg] = useState<RelationOption[]>(
    npc?.organization ? [npc.organization] : []
  );
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  useFormGuard(dirty);

  // ── Mention → picker auto-sync ──
  const suppressedOrgs = useRef(new Set<string>());

  // Seed suppressed set in edit mode: mentions already in notes but NOT in
  // the organization field were intentionally excluded by the user previously.
  const initializedRef = useRef(false);
  useEffect(() => {
    if (initializedRef.current || !npc?.notesBody) return;
    initializedRef.current = true;
    const mentions = extractMentionsFromContent(npc.notesBody as JSONContent);
    const orgId = selectedOrg[0]?.id;
    for (const m of mentions.organization) if (m.id !== orgId) suppressedOrgs.current.add(m.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Wrap picker onChange to track manual removals in suppressed set
  const handleOrgChange = useCallback((next: RelationOption[]) => {
    setSelectedOrg((prev) => {
      for (const p of prev) if (!next.some((n) => n.id === p.id)) suppressedOrgs.current.add(p.id);
      return next;
    });
  }, []);

  // Sync mentions from editor content into organization picker
  const handleNotesChange = useCallback((content: JSONContent) => {
    setNotesBody(content);
    setDirty(true);

    const mentions = extractMentionsFromContent(content);

    // Organization — single select, only auto-set if currently empty
    setSelectedOrg((prev) => {
      if (prev.length > 0) return prev;
      const toAdd = mentions.organization.find((m) => !suppressedOrgs.current.has(m.id));
      return toAdd ? [{ id: toAdd.id, name: toAdd.label }] : prev;
    });
  }, []);

  // Combobox option lists (per-campaign)
  const [genderOptions, setGenderOptions] = useState<string[]>([]);
  const [raceOptions, setRaceOptions] = useState<string[]>([]);

  useEffect(() => {
    getFormOptions("npcGender").then(setGenderOptions);
    getFormOptions("npcRace").then(setRaceOptions);
  }, []);

  const handleOptionChange = useCallback(
    (category: FormOptionCategory, setOptions: (opts: string[]) => void) => ({
      onAdd: (opt: string) => {
        setOptions((prev) => {
          const next = [...prev, opt];
          updateFormOptions(category, next);
          return next;
        });
      },
      onRemove: (opt: string) => {
        setOptions((prev) => {
          const next = prev.filter((o) => o !== opt);
          updateFormOptions(category, next);
          return next;
        });
      },
    }),
    [],
  );

  const genderHandlers = handleOptionChange("npcGender", setGenderOptions);
  const raceHandlers = handleOptionChange("npcRace", setRaceOptions);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = {
        name,
        aliasTitle: aliasTitle || undefined,
        gender: gender || undefined,
        classRole: classRole || undefined,
        race: race || undefined,
        status,
        alignmentStance: partyMember ? undefined : alignmentStance,
        partyMember,
        organizationId: selectedOrg[0]?.id || undefined,
        notesBody: notesBody ?? undefined,
        mainImage: mainImage ?? undefined,
      };

      if (isEdit) {
        await updateNpc(npc.id, {
          ...data,
          organizationId: data.organizationId ?? null,
          mainImage: mainImage,
        });
        toast.success("NPC updated.");
        router.push(`/npcs/${npc.id}`);
      } else {
        const newNpc = await createNpc({ ...data, campaignId });
        toast.success("NPC created.");
        router.push(`/npcs/${newNpc.id}`);
      }
    } catch {
      toast.error("Failed to save NPC.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form id="npc-form" onSubmit={handleSubmit} onChange={() => setDirty(true)} className="space-y-6">
      <fieldset disabled={saving} className="space-y-6">
      {/* Identity — portrait left, fields right */}
      <div className="flex flex-col gap-6 sm:flex-row">
        {/* Portrait */}
        <div className="w-full space-y-2 sm:w-48 sm:shrink-0">
          <Label>Portrait</Label>
          <ImageUpload value={mainImage} onChange={setMainImage} className="aspect-square" />
        </div>

        {/* Identity fields */}
        <div className="flex-1 space-y-4">
          {/* Row 1: Name (wide) + Alias */}
          <div className="flex flex-wrap items-end gap-4">
            <div className="min-w-[200px] flex-1 space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="NPC name"
                required
              />
            </div>
            <div className="min-w-[200px] flex-1 space-y-2">
              <Label htmlFor="aliasTitle">Alias / Title</Label>
              <Input
                id="aliasTitle"
                value={aliasTitle}
                onChange={(e) => setAliasTitle(e.target.value)}
                placeholder='e.g. "The Shadow Broker"'
              />
            </div>
          </div>

          {/* Row 2: Race, Gender, Class/Role, Status */}
          <div className="flex flex-wrap items-end gap-4">
            <div className="w-36 space-y-2">
              <Label>Race</Label>
              <ComboboxInput
                value={race}
                onChange={setRace}
                options={raceOptions}
                onAddOption={raceHandlers.onAdd}
                onRemoveOption={raceHandlers.onRemove}
                placeholder="e.g. Elf"
              />
            </div>
            <div className="w-32 space-y-2">
              <Label>Gender</Label>
              <ComboboxInput
                value={gender}
                onChange={setGender}
                options={genderOptions}
                onAddOption={genderHandlers.onAdd}
                onRemoveOption={genderHandlers.onRemove}
                placeholder="e.g. Male"
              />
            </div>
            <div className="min-w-[140px] flex-1 space-y-2">
              <Label htmlFor="classRole">Class / Role</Label>
              <Input
                id="classRole"
                value={classRole}
                onChange={(e) => setClassRole(e.target.value)}
                placeholder="e.g. Wizard, Merchant"
              />
            </div>
            <div className="w-32 space-y-2">
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
            {!partyMember && (
              <div className="w-40 space-y-2">
                <Label>Stance</Label>
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
            )}
          </div>

          {/* Row 3: Party Member toggle */}
          <div className="flex items-center gap-3">
            <Switch
              checked={partyMember}
              onCheckedChange={setPartyMember}
              id="partyMember"
            />
            <Label htmlFor="partyMember">Party Member</Label>
          </div>
        </div>
      </div>

      {/* Relations — bordered card */}
      <div className="rounded-lg border border-border p-4 sm:max-w-sm">
        <RelationPicker
          label={<><Shield className="h-4 w-4" /> Organization</>}
          options={allOrganizations}
          selected={selectedOrg}
          onChange={handleOrgChange}
          placeholder="Search organizations..."
          single
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label>Notes</Label>
        <RichTextEditor
          content={notesBody}
          onChange={handleNotesChange}
          placeholder="Write notes about this NPC..."
        />
      </div>
      </fieldset>
    </form>
  );
}
