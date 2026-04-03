"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormGuard } from "@/hooks/use-form-guard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RelationPicker, type RelationOption } from "@/components/shared/relation-picker";
import { createQuest, updateQuest } from "@/lib/actions/quests";
import { toast } from "sonner";
import { ScrollText } from "lucide-react";
import type { QuestStatus } from "@/generated/prisma/client";
import type { QuestDetail } from "@/types";

const STATUS_OPTIONS: { value: QuestStatus; label: string }[] = [
  { value: "LEAD", label: "Lead" },
  { value: "ACTIVE", label: "Active" },
  { value: "COMPLETED", label: "Completed" },
  { value: "FAILED", label: "Failed" },
];

export function QuestFormActions({ isEdit }: { isEdit: boolean }) {
  const router = useRouter();
  return (
    <>
      <Button type="submit" form="quest-form">
        {isEdit ? "Save Changes" : "Create Quest"}
      </Button>
      <Button type="button" variant="outline" onClick={() => router.back()}>
        Cancel
      </Button>
    </>
  );
}

interface QuestFormProps {
  campaignId: string;
  quest?: QuestDetail;
  allSessions: RelationOption[];
}

export function QuestForm({ campaignId, quest, allSessions }: QuestFormProps) {
  const router = useRouter();
  const isEdit = !!quest;

  const [name, setName] = useState(quest?.name ?? "");
  const [status, setStatus] = useState<QuestStatus>(quest?.status ?? "LEAD");
  const [description, setDescription] = useState(quest?.description ?? "");
  const [selectedSessions, setSelectedSessions] = useState<RelationOption[]>(
    quest?.sessions.map((s) => ({
      id: s.session.id,
      name: `#${s.session.sessionNumber}${s.session.title ? ` — ${s.session.title}` : ""}`,
    })) ?? []
  );
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  useFormGuard(dirty);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = {
        name,
        status,
        description: description || undefined,
        sessionIds: selectedSessions.map((s) => s.id),
      };

      if (isEdit) {
        await updateQuest(quest.id, {
          ...data,
          description: description || null,
        });
        toast.success("Quest updated.");
        router.push(`/quests/${quest.id}`);
      } else {
        const newQuest = await createQuest({ ...data, campaignId });
        toast.success("Quest created.");
        router.push(`/quests/${newQuest.id}`);
      }
    } catch {
      toast.error("Failed to save quest.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form id="quest-form" onSubmit={handleSubmit} onChange={() => setDirty(true)} className="space-y-6">
      <fieldset disabled={saving} className="space-y-6">
        {/* Name + Status */}
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[200px] flex-1 space-y-2">
            <Label htmlFor="name">Quest Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Find the Lost Amulet"
              required
            />
          </div>
          <div className="w-40 space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as QuestStatus)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief summary of the quest objective, clues, or what you know so far..."
            rows={3}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        {/* Linked Sessions */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-border p-4">
            <RelationPicker
              label={<><ScrollText className="h-4 w-4" /> Linked Sessions</>}
              options={allSessions}
              selected={selectedSessions}
              onChange={setSelectedSessions}
              placeholder="Search sessions..."
            />
          </div>
        </div>
      </fieldset>
    </form>
  );
}
