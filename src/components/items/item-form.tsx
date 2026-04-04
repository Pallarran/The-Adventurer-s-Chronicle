"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormGuard } from "@/hooks/use-form-guard";
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
import { Switch } from "@/components/ui/switch";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { TagInput, type TagOption } from "@/components/shared/tag-input";
import { ImageUpload } from "@/components/shared/image-upload";
import { createItem, updateItem } from "@/lib/actions/items";
import { createTag } from "@/lib/actions/tags";
import {
  RARITY_OPTIONS,
  ITEM_TYPE_OPTIONS,
  AURA_STRENGTH_OPTIONS,
  MAGIC_SCHOOL_OPTIONS,
} from "@/lib/colors";
import { toast } from "sonner";
import { Tag } from "lucide-react";
import type { JSONContent } from "@tiptap/react";
import type { ItemDetail } from "@/types";

/** Split a stored aura string like "Moderate Transmutation" into [strength, school]. */
function parseAura(aura: string | null | undefined): [string, string] {
  if (!aura) return ["", ""];
  const strengths: readonly string[] = AURA_STRENGTH_OPTIONS;
  for (const s of strengths) {
    if (aura.startsWith(s + " ")) return [s, aura.slice(s.length + 1)];
    if (aura === s) return [s, ""];
  }
  // No recognized strength prefix — treat entire string as school
  return ["", aura];
}

/** Join strength + school back into a single aura string. */
function joinAura(strength: string, school: string): string {
  if (strength && school) return `${strength} ${school}`;
  return strength || school;
}

export function ItemFormActions({ isEdit }: { isEdit: boolean }) {
  const router = useRouter();
  return (
    <>
      <Button type="submit" form="item-form">
        {isEdit ? "Save Changes" : "Create Item"}
      </Button>
      <Button type="button" variant="outline" onClick={() => router.back()}>
        Cancel
      </Button>
    </>
  );
}

interface ItemFormProps {
  campaignId: string;
  item?: ItemDetail;
  allTags: TagOption[];
}

export function ItemForm({ campaignId, item, allTags }: ItemFormProps) {
  const router = useRouter();
  const isEdit = !!item;

  const [name, setName] = useState(item?.name ?? "");
  const [type, setType] = useState(item?.type ?? "");
  const [rarity, setRarity] = useState(item?.rarity ?? "");
  const [parsedAura] = useState(() => parseAura(item?.aura));
  const [auraStrength, setAuraStrength] = useState(parsedAura[0]);
  const [auraSchool, setAuraSchool] = useState(parsedAura[1]);
  const [attunement, setAttunement] = useState(item?.attunement ?? false);
  const [sold, setSold] = useState(item?.sold ?? false);
  const [mainImage, setMainImage] = useState<string | null>(item?.mainImage ?? null);
  const [notesBody, setNotesBody] = useState<JSONContent | null>(
    (item?.notesBody as JSONContent) ?? null
  );
  const [selectedTags, setSelectedTags] = useState<TagOption[]>(
    item?.tags.map((t) => t.tag) ?? []
  );
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  useFormGuard(dirty);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const aura = joinAura(auraStrength, auraSchool);

    try {
      const data = {
        name,
        type: type || undefined,
        rarity: rarity || undefined,
        aura: aura || undefined,
        attunement,
        sold,
        mainImage: mainImage ?? undefined,
        notesBody: notesBody ?? undefined,
        tagIds: selectedTags.map((t) => t.id),
      };

      if (isEdit) {
        await updateItem(item.id, {
          ...data,
          type: type || null,
          rarity: rarity || null,
          aura: aura || null,
          mainImage: mainImage,
        });
        toast.success("Item updated.");
        router.push(`/items/${item.id}`);
      } else {
        const newItem = await createItem({ ...data, campaignId });
        toast.success("Item created.");
        router.push(`/items/${newItem.id}`);
      }
    } catch {
      toast.error("Failed to save item.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateTag = async (tagName: string): Promise<TagOption> => {
    const tag = await createTag(campaignId, tagName);
    return { id: tag.id, name: tag.name };
  };

  // Select "none" sentinel value to clear
  const NONE = "__none__";

  return (
    <form id="item-form" onSubmit={handleSubmit} onChange={() => setDirty(true)} className="space-y-6">
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
                  placeholder="Item name"
                  required
                />
              </div>
              <div className="w-44 space-y-2">
                <Label>Type</Label>
                <Select
                  value={type || NONE}
                  onValueChange={(val) => { setType(!val || val === NONE ? "" : val); setDirty(true); }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>None</SelectItem>
                    {ITEM_TYPE_OPTIONS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 2: Rarity + Aura Strength + Magic School */}
            <div className="flex flex-wrap items-end gap-4">
              <div className="w-40 space-y-2">
                <Label>Rarity</Label>
                <Select
                  value={rarity || NONE}
                  onValueChange={(val) => { setRarity(!val || val === NONE ? "" : val); setDirty(true); }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select rarity..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>None</SelectItem>
                    {RARITY_OPTIONS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-40 space-y-2">
                <Label>Aura Strength</Label>
                <Select
                  value={auraStrength || NONE}
                  onValueChange={(val) => { setAuraStrength(!val || val === NONE ? "" : val); setDirty(true); }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Strength..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>None</SelectItem>
                    {AURA_STRENGTH_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-44 space-y-2">
                <Label>Magic School</Label>
                <Select
                  value={auraSchool || NONE}
                  onValueChange={(val) => { setAuraSchool(!val || val === NONE ? "" : val); setDirty(true); }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="School..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>None</SelectItem>
                    {MAGIC_SCHOOL_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 3: Toggles */}
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3">
                <Switch
                  checked={attunement}
                  onCheckedChange={(checked) => { setAttunement(checked); setDirty(true); }}
                  id="attunement"
                />
                <Label htmlFor="attunement" className="cursor-pointer">Requires Attunement</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={sold}
                  onCheckedChange={(checked) => { setSold(checked); setDirty(true); }}
                  id="sold"
                />
                <Label htmlFor="sold" className="cursor-pointer">Sold</Label>
              </div>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="rounded-lg border border-border p-4">
          <TagInput
            label={<><Tag className="h-4 w-4" /> Tags</>}
            availableTags={allTags}
            selectedTags={selectedTags}
            onChange={setSelectedTags}
            onCreateTag={handleCreateTag}
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label>Description &amp; Effects</Label>
          <RichTextEditor
            content={notesBody}
            onChange={(c) => { setNotesBody(c); setDirty(true); }}
            placeholder="Describe this item's properties, effects, and lore..."
          />
        </div>
      </fieldset>
    </form>
  );
}
