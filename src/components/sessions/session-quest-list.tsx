"use client";

import { useState, useCallback } from "react";
import { Plus, Save, Loader2, X, Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { createQuest, updateQuest } from "@/lib/actions/quests";
import type { QuestStatus } from "@/generated/prisma/client";

// ── Types ──

interface QuestRow {
  id: string;
  name: string;
  status: QuestStatus;
  description: string | null;
  persisted: boolean; // true = saved to DB
}

interface SessionQuestListProps {
  initialQuests: QuestRow[];
  campaignId: string;
  onQuestsChange: (ids: string[]) => void;
  disabled?: boolean;
}

// ── Status styling ──

const STATUS_OPTIONS: { value: QuestStatus; label: string; color: string }[] = [
  { value: "LEAD", label: "Lead", color: "amber" },
  { value: "ACTIVE", label: "Active", color: "blue" },
  { value: "COMPLETED", label: "Completed", color: "emerald" },
  { value: "FAILED", label: "Failed", color: "red" },
];

const STATUS_CONFIG: Record<QuestStatus, { label: string; borderClass: string; dotClass: string }> = {
  LEAD: { label: "Lead", borderClass: "border-l-amber-500", dotClass: "bg-amber-500" },
  ACTIVE: { label: "Active", borderClass: "border-l-blue-500", dotClass: "bg-blue-500" },
  COMPLETED: { label: "Completed", borderClass: "border-l-emerald-500", dotClass: "bg-emerald-500" },
  FAILED: { label: "Failed", borderClass: "border-l-red-500", dotClass: "bg-red-500" },
};

// ── Row component ──

function QuestRowItem({
  row,
  isExpanded,
  onToggle,
  onSave,
  onRemove,
  saving,
}: {
  row: QuestRow;
  isExpanded: boolean;
  onToggle: () => void;
  onSave: (data: { name: string; status: QuestStatus; description: string | null }) => void;
  onRemove: () => void;
  saving: boolean;
}) {
  const [editName, setEditName] = useState(row.name);
  const [editStatus, setEditStatus] = useState<QuestStatus>(row.status);
  const [editDescription, setEditDescription] = useState(row.description ?? "");

  const config = STATUS_CONFIG[row.status];

  return (
    <div className={cn("border-l-2 transition-colors", config.borderClass, "group")}>
      {/* Collapsed row */}
      <div
        className="grid cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-muted/30 grid-cols-[10px_minmax(0,1fr)_minmax(0,1.5fr)]"
        onClick={onToggle}
      >
        {/* Status dot */}
        <span className={cn("h-2.5 w-2.5 rounded-full", config.dotClass)} />

        {/* Name */}
        <span className="truncate font-medium">{row.name || "Untitled quest"}</span>

        {/* Description preview */}
        <span className="truncate text-xs text-muted-foreground">
          {row.description || ""}
        </span>
      </div>

      {/* Expanded edit form */}
      {isExpanded && (
        <div className="space-y-3 border-t border-border/50 bg-muted/10 px-3 py-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Name</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Quest or goal name..."
                className="h-8 text-sm"
                autoFocus
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Status</Label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as QuestStatus)}
                className="flex h-8 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-36"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Description</Label>
            <Textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Brief notes about this quest or goal..."
              rows={2}
              className="text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="gap-1.5"
              disabled={saving || !editName.trim()}
              onClick={(e) => {
                e.stopPropagation();
                onSave({
                  name: editName.trim(),
                  status: editStatus,
                  description: editDescription.trim() || null,
                });
              }}
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Save
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="gap-1.5 text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              <X className="h-3.5 w-3.5" />
              Remove
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main component ──

let tempIdCounter = 0;

export function SessionQuestList({
  initialQuests,
  campaignId,
  onQuestsChange,
  disabled,
}: SessionQuestListProps) {
  const [quests, setQuests] = useState<QuestRow[]>(initialQuests);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const notifyChange = useCallback(
    (rows: QuestRow[]) => {
      onQuestsChange(rows.filter((r) => r.persisted).map((r) => r.id));
    },
    [onQuestsChange]
  );

  const handleToggle = useCallback(
    (id: string) => setExpandedId((prev) => (prev === id ? null : id)),
    []
  );

  const handleAdd = useCallback(() => {
    const tempId = `temp-${++tempIdCounter}`;
    const newRow: QuestRow = {
      id: tempId,
      name: "",
      status: "LEAD",
      description: null,
      persisted: false,
    };
    setQuests((prev) => [...prev, newRow]);
    setExpandedId(tempId);
  }, []);

  const handleSave = useCallback(
    async (id: string, data: { name: string; status: QuestStatus; description: string | null }) => {
      setSavingId(id);
      try {
        const row = quests.find((r) => r.id === id);
        if (!row) return;

        if (row.persisted) {
          // Update existing quest
          await updateQuest(id, {
            name: data.name,
            status: data.status,
            description: data.description,
          });
          setQuests((prev) =>
            prev.map((r) => (r.id === id ? { ...r, ...data } : r))
          );
        } else {
          // Create new quest
          const created = await createQuest({
            campaignId,
            name: data.name,
            status: data.status,
            description: data.description ?? undefined,
          });
          setQuests((prev) => {
            const updated = prev.map((r) =>
              r.id === id
                ? { ...r, ...data, id: created.id, persisted: true }
                : r
            );
            // Notify parent with real IDs
            onQuestsChange(updated.filter((r) => r.persisted).map((r) => r.id));
            return updated;
          });
        }
        setExpandedId(null);
      } catch (err) {
        console.error("Failed to save quest:", err);
      } finally {
        setSavingId(null);
      }
    },
    [quests, campaignId, onQuestsChange]
  );

  const handleRemove = useCallback(
    (id: string) => {
      setQuests((prev) => {
        const updated = prev.filter((r) => r.id !== id);
        notifyChange(updated);
        return updated;
      });
      if (expandedId === id) setExpandedId(null);
    },
    [expandedId, notifyChange]
  );

  return (
    <Card className={cn(disabled && "pointer-events-none opacity-60")}>
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-border px-3 py-2 text-sm font-medium">
          <Compass className="h-4 w-4" />
          Quests & Goals
        </div>

        {/* Rows */}
        {quests.length > 0 ? (
          <div className="divide-y divide-border/30">
            {quests.map((row) => (
              <QuestRowItem
                key={row.id}
                row={row}
                isExpanded={expandedId === row.id}
                onToggle={() => handleToggle(row.id)}
                onSave={(data) => handleSave(row.id, data)}
                onRemove={() => handleRemove(row.id)}
                saving={savingId === row.id}
              />
            ))}
          </div>
        ) : (
          <div className="px-3 py-4 text-center text-sm text-muted-foreground/60">
            No quests or goals noted for this session.
          </div>
        )}

        {/* Footer: Legend + Add */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-3 py-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground/60">
            {STATUS_OPTIONS.map((opt) => (
              <span key={opt.value} className="flex items-center gap-1">
                <span className={cn("h-2 w-2 rounded-full", STATUS_CONFIG[opt.value].dotClass)} />
                {opt.label}
              </span>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={handleAdd}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Quest
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
