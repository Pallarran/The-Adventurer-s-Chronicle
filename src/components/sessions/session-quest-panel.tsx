"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { Plus, Save, Loader2, X, Compass, Link2, ChevronRight, ChevronDown, User } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { RelationPicker, type RelationOption } from "@/components/shared/relation-picker";
import { QuestStatusControl } from "@/components/quests/quest-status-control";
import { createQuest, updateQuest, setQuestStatus } from "@/lib/actions/quests";
import { QUEST_STATUS_ORDER, QUEST_STATUS_STYLES, RESOLVED_STATUSES } from "@/lib/quest-status";
import type { QuestStatus } from "@/generated/prisma/client";

const isResolved = (s: QuestStatus) => RESOLVED_STATUSES.includes(s);

// ── Types ──

export interface QuestPanelItem {
  id: string;
  name: string;
  status: QuestStatus;
  description: string | null;
  questGiverNpcId: string | null;
}

export interface StagedQuestChanges {
  // existing quests whose status was changed while creating the session
  statusEdits: { questId: string; toStatus: QuestStatus }[];
  // brand-new quests authored while creating the session
  newQuests: { name: string; status: QuestStatus; description: string | null; questGiverNpcId: string | null }[];
}

interface QuestRow extends QuestPanelItem {
  persisted: boolean; // false = unsaved temp row being created
  baseStatus: QuestStatus; // status at mount (for create-mode staging diff)
  saved: boolean; // temp rows: true once the editor has been saved locally
}

interface SessionQuestPanelProps {
  /** Quests already linked to this session. */
  linkedQuests: QuestPanelItem[];
  /** All open (Lead + Active) quests in the campaign. */
  openQuests: QuestPanelItem[];
  /** Resolved (Completed + Failed) quests — hidden behind a toggle, available to reopen. */
  resolvedQuests: QuestPanelItem[];
  /** All NPCs in the campaign — options for the quest-giver picker. */
  allNpcs: RelationOption[];
  campaignId: string;
  /** Undefined for a not-yet-saved session (create form). */
  sessionId?: string;
  /** Create mode only: report staged quest changes for the form to apply on save. */
  onStagedChange?: (staged: StagedQuestChanges) => void;
  /** Mark the form dirty when the user touches a quest. */
  onActivity?: () => void;
  disabled?: boolean;
}

let tempIdCounter = 0;

function dedupeById(items: QuestPanelItem[]): QuestPanelItem[] {
  const seen = new Set<string>();
  const out: QuestPanelItem[] = [];
  for (const it of items) {
    if (seen.has(it.id)) continue;
    seen.add(it.id);
    out.push(it);
  }
  return out;
}

// ── Row ──

function QuestRowItem({
  row,
  featured,
  expanded,
  saving,
  statusPending,
  isEdit,
  allNpcs,
  onToggleExpand,
  onStatusChange,
  onSave,
  onDiscard,
}: {
  row: QuestRow;
  featured: boolean;
  expanded: boolean;
  saving: boolean;
  statusPending: boolean;
  isEdit: boolean;
  allNpcs: RelationOption[];
  onToggleExpand: () => void;
  onStatusChange: (s: QuestStatus) => void;
  onSave: (data: { name: string; status: QuestStatus; description: string | null; questGiverNpcId: string | null }) => void;
  onDiscard: () => void;
}) {
  const [editName, setEditName] = useState(row.name);
  const [editStatus, setEditStatus] = useState<QuestStatus>(row.status);
  const [editDescription, setEditDescription] = useState(row.description ?? "");
  const [editQuestGiver, setEditQuestGiver] = useState<RelationOption[]>(() => {
    if (!row.questGiverNpcId) return [];
    const n = allNpcs.find((x) => x.id === row.questGiverNpcId);
    return [{ id: row.questGiverNpcId, name: n?.name ?? "Unknown NPC" }];
  });

  const styles = QUEST_STATUS_STYLES[row.status];

  return (
    <div className={cn("border-l-2 transition-colors", styles.borderClass, "group")}>
      {/* Collapsed row */}
      <div className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted/30">
        {/* "In this session" indicator (non-interactive) */}
        <span
          title={featured ? "In this session" : undefined}
          className={cn(
            "h-2 w-2 shrink-0 rounded-full",
            featured ? "bg-gold" : "bg-transparent ring-1 ring-inset ring-border"
          )}
        />

        {/* Inline status (persisted) or static dot (temp) */}
        {row.persisted ? (
          <QuestStatusControl
            status={row.status}
            isPending={statusPending}
            onSelect={onStatusChange}
          />
        ) : (
          <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", styles.dotClass)} />
        )}

        {/* Name + description (click to expand the editor) */}
        <button
          type="button"
          onClick={onToggleExpand}
          className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden text-left"
        >
          <span className="shrink-0 font-medium">{row.name || "Untitled quest"}</span>
          <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
            {row.description || ""}
          </span>
        </button>
      </div>

      {/* Expanded editor */}
      {expanded && (
        <div className="space-y-3 border-t border-border/50 bg-muted/10 px-3 py-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div className={cn("space-y-1", row.persisted ? "sm:col-span-3" : "sm:col-span-2")}>
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Name</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Quest or goal name..."
                className="h-8 text-sm"
                autoFocus
              />
            </div>
            {/* Status select only for new (temp) rows; persisted rows use the inline badge */}
            {!row.persisted && (
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Status</Label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as QuestStatus)}
                  className="flex h-8 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {QUEST_STATUS_ORDER.map((value) => (
                    <option key={value} value={value}>
                      {QUEST_STATUS_STYLES[value].label}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="space-y-1">
              <RelationPicker
                label={<><User className="h-3.5 w-3.5" /> Quest Giver</>}
                options={allNpcs}
                selected={editQuestGiver}
                onChange={setEditQuestGiver}
                placeholder="Search NPCs..."
                single
              />
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
              onClick={() =>
                onSave({
                  name: editName.trim(),
                  status: editStatus,
                  description: editDescription.trim() || null,
                  questGiverNpcId: editQuestGiver[0]?.id ?? null,
                })
              }
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {row.persisted || isEdit ? "Save" : "Done"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="gap-1.5 text-muted-foreground hover:text-foreground"
              onClick={onDiscard}
            >
              <X className="h-3.5 w-3.5" />
              {row.persisted ? "Cancel" : "Discard"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Panel ──

export function SessionQuestPanel({
  linkedQuests,
  openQuests,
  resolvedQuests,
  allNpcs,
  campaignId,
  sessionId,
  onStagedChange,
  onActivity,
  disabled,
}: SessionQuestPanelProps) {
  const isEdit = !!sessionId;

  const [rows, setRows] = useState<QuestRow[]>(() =>
    dedupeById([...linkedQuests, ...openQuests, ...resolvedQuests]).map((q) => ({
      ...q,
      persisted: true,
      baseStatus: q.status,
      saved: true,
    }))
  );
  const [showResolved, setShowResolved] = useState(false);
  // Quests shown as "in this session" — seeded from the existing links, grows as you touch quests.
  const [featuredIds, setFeaturedIds] = useState<Set<string>>(
    () => new Set(linkedQuests.map((q) => q.id))
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [statusPendingId, setStatusPendingId] = useState<string | null>(null);

  const feature = useCallback((id: string) => {
    setFeaturedIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  // Create mode: report staged changes to the form (post-render, never during render).
  useEffect(() => {
    if (isEdit || !onStagedChange) return;
    const statusEdits = rows
      .filter((r) => r.persisted && r.status !== r.baseStatus)
      .map((r) => ({ questId: r.id, toStatus: r.status }));
    const newQuests = rows
      .filter((r) => !r.persisted && r.saved && r.name.trim())
      .map((r) => ({ name: r.name.trim(), status: r.status, description: r.description, questGiverNpcId: r.questGiverNpcId }));
    onStagedChange({ statusEdits, newQuests });
  }, [rows, isEdit, onStagedChange]);

  const handleStatusChange = useCallback(
    async (id: string, newStatus: QuestStatus) => {
      const prevStatus = rows.find((r) => r.id === id)?.status;
      if (!prevStatus || prevStatus === newStatus) return;
      onActivity?.();
      // optimistic
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
      feature(id);

      if (!isEdit) return; // create mode: staged, applied on session save

      setStatusPendingId(id);
      try {
        const result = await setQuestStatus(id, newStatus, { sessionId });
        if (!result.ok) {
          setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: prevStatus } : r)));
          toast.error(result.error);
        }
      } catch {
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: prevStatus } : r)));
        toast.error("Failed to update quest status.");
      } finally {
        setStatusPendingId(null);
      }
    },
    [rows, isEdit, sessionId, feature, onActivity]
  );

  const handleAddNew = useCallback(() => {
    const tempId = `temp-${++tempIdCounter}`;
    setRows((prev) => [
      ...prev,
      { id: tempId, name: "", status: "LEAD", description: null, questGiverNpcId: null, persisted: false, baseStatus: "LEAD", saved: false },
    ]);
    setExpandedId(tempId);
  }, []);

  const handleSave = useCallback(
    async (id: string, data: { name: string; status: QuestStatus; description: string | null; questGiverNpcId: string | null }) => {
      const row = rows.find((r) => r.id === id);
      if (!row) return;
      onActivity?.();

      // Persisted quest: name/description/giver edits (status flows through the badge).
      if (row.persisted) {
        setSavingId(id);
        try {
          const result = await updateQuest(id, { name: data.name, description: data.description, questGiverNpcId: data.questGiverNpcId });
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          setRows((prev) =>
            prev.map((r) => (r.id === id ? { ...r, name: data.name, description: data.description, questGiverNpcId: data.questGiverNpcId } : r))
          );
          setExpandedId(null);
        } catch {
          toast.error("Failed to save quest.");
        } finally {
          setSavingId(null);
        }
        return;
      }

      // New quest. Create mode: stage locally. Edit mode: create immediately (stamped to the session).
      if (!isEdit) {
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...data, saved: true } : r)));
        setExpandedId(null);
        return;
      }

      setSavingId(id);
      try {
        const result = await createQuest({
          campaignId,
          name: data.name,
          status: data.status,
          description: data.description ?? undefined,
          questGiverNpcId: data.questGiverNpcId ?? undefined,
          originSessionId: sessionId,
        });
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        const created = result.data;
        setRows((prev) =>
          prev.map((r) =>
            r.id === id
              ? { ...r, ...data, id: created.id, persisted: true, baseStatus: data.status, saved: true }
              : r
          )
        );
        feature(created.id);
        setExpandedId(null);
      } catch {
        toast.error("Failed to save quest.");
      } finally {
        setSavingId(null);
      }
    },
    [rows, campaignId, sessionId, isEdit, feature, onActivity]
  );

  const handleDiscard = useCallback((id: string, persisted: boolean) => {
    if (persisted) {
      setExpandedId((prev) => (prev === id ? null : prev));
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
    setExpandedId((prev) => (prev === id ? null : prev));
  }, []);

  const isFeatured = useCallback(
    (r: QuestRow) => !r.persisted || featuredIds.has(r.id),
    [featuredIds]
  );

  // A resolved quest that isn't tied to this session is hidden until "show resolved".
  const isHidden = useCallback(
    (r: QuestRow) => r.persisted && isResolved(r.status) && !isFeatured(r) && !showResolved,
    [isFeatured, showResolved]
  );

  // Sort: featured first, then by status order, then name.
  const sortedRows = useMemo(() => {
    const order = (s: QuestStatus) => QUEST_STATUS_ORDER.indexOf(s);
    return [...rows].sort((a, b) => {
      const af = isFeatured(a) ? 0 : 1;
      const bf = isFeatured(b) ? 0 : 1;
      if (af !== bf) return af - bf;
      if (a.status !== b.status) return order(a.status) - order(b.status);
      return a.name.localeCompare(b.name);
    });
  }, [rows, isFeatured]);

  const visibleRows = useMemo(() => sortedRows.filter((r) => !isHidden(r)), [sortedRows, isHidden]);
  const hiddenResolvedCount = useMemo(
    () => rows.filter((r) => r.persisted && isResolved(r.status) && !isFeatured(r)).length,
    [rows, isFeatured]
  );

  const featuredCount = useMemo(
    () => rows.filter((r) => isFeatured(r)).length,
    [rows, isFeatured]
  );

  return (
    <Card className={cn(disabled && "pointer-events-none opacity-60")}>
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2 text-sm font-medium">
          <span className="flex items-center gap-2">
            <Compass className="h-4 w-4" />
            Quests &amp; Goals
          </span>
          <span className="flex items-center gap-1 text-xs font-normal text-muted-foreground">
            <Link2 className="h-3.5 w-3.5" />
            {featuredCount} in this session
          </span>
        </div>

        {/* Rows */}
        {visibleRows.length > 0 ? (
          <div className="divide-y divide-border/30">
            {visibleRows.map((row) => (
              <QuestRowItem
                key={row.id}
                row={row}
                featured={!row.persisted || featuredIds.has(row.id)}
                expanded={expandedId === row.id}
                saving={savingId === row.id}
                statusPending={statusPendingId === row.id}
                isEdit={isEdit}
                allNpcs={allNpcs}
                onToggleExpand={() => setExpandedId((prev) => (prev === row.id ? null : row.id))}
                onStatusChange={(s) => handleStatusChange(row.id, s)}
                onSave={(data) => handleSave(row.id, data)}
                onDiscard={() => handleDiscard(row.id, row.persisted)}
              />
            ))}
          </div>
        ) : (
          <div className="px-3 py-4 text-center text-sm text-muted-foreground/60">
            No open quests. Add one to start tracking goals for this session.
          </div>
        )}

        {/* Show/hide resolved quests (reopen) */}
        {(hiddenResolvedCount > 0 || showResolved) && (
          <button
            type="button"
            onClick={() => setShowResolved((v) => !v)}
            className="flex w-full items-center gap-1.5 border-t border-border px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground"
          >
            {showResolved ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
            {showResolved
              ? "Hide resolved quests"
              : `Show ${hiddenResolvedCount} resolved quest${hiddenResolvedCount === 1 ? "" : "s"}`}
          </button>
        )}

        {/* Footer: legend + add */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-3 py-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground/60">
            {QUEST_STATUS_ORDER.map((value) => (
              <span key={value} className="flex items-center gap-1">
                <span className={cn("h-2 w-2 rounded-full", QUEST_STATUS_STYLES[value].dotClass)} />
                {QUEST_STATUS_STYLES[value].label}
              </span>
            ))}
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-gold" />
              changing a status ties the quest to this session
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={handleAddNew}
          >
            <Plus className="h-3.5 w-3.5" />
            New Quest
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
