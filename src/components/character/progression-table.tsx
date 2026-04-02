"use client";

import { useState, useCallback, useRef } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Check,
  Circle,
  Minus,
  Plus,
  Save,
  Trash2,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  updateProgressionRow,
  addProgressionRow,
  deleteProgressionRow,
  reorderProgressionRow,
} from "@/lib/actions/character";
import type { ProgressionRow } from "./character-hub-client";

interface ProgressionTableProps {
  rows: ProgressionRow[];
  profileId: string;
  characterLevel: number | null;
}

// ── Status helpers ──

function StatusIcon({
  status,
  rowType,
}: {
  status: ProgressionRow["status"];
  rowType: ProgressionRow["rowType"];
}) {
  if (status === "DONE") {
    return <Check className="h-3.5 w-3.5 text-emerald-500" />;
  }
  if (status === "CURRENT") {
    return <Circle className="h-3 w-3 fill-blue-500 text-blue-500" />;
  }
  if (rowType !== "LEVEL") {
    return <Minus className="h-3 w-3 text-muted-foreground/40" />;
  }
  return <span className="h-3 w-3" />;
}

// ── Row styling by type + status ──

function rowClasses(row: ProgressionRow) {
  const base = "border-l-2 transition-colors";
  const done = row.status === "DONE";
  const current = row.status === "CURRENT";

  // Non-level rows: planned = muted, done = vibrant (you've earned it)
  if (row.rowType === "DOWNTIME") {
    return cn(base, "border-l-amber-500", !done && "opacity-50");
  }
  if (row.rowType === "THEME") {
    return cn(base, "border-l-purple-500", !done && "opacity-50");
  }

  // Level rows: done & current = vibrant (you have those abilities), future = muted
  if (done) return cn(base, "border-l-emerald-500");
  if (current) return cn(base, "bg-blue-500/5 border-l-blue-500");
  return cn(base, "border-l-transparent opacity-50");
}

// ── Sortable row wrapper ──

function SortableRow({
  row,
  isExpanded,
  onToggle,
  onSave,
  onDelete,
  saving,
}: {
  row: ProgressionRow;
  isExpanded: boolean;
  onToggle: () => void;
  onSave: (data: Partial<ProgressionRow>) => void;
  onDelete: () => void;
  saving: boolean;
}) {
  const isDraggable = row.rowType !== "LEVEL";
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: row.id,
    disabled: !isDraggable,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Local editing state
  const [editLabel, setEditLabel] = useState(row.label ?? "");
  const [editClassLabel, setEditClassLabel] = useState(row.classLabel ?? "");
  const [editFeatures, setEditFeatures] = useState(row.features ?? "");
  const [editSpells, setEditSpells] = useState(row.spells ?? "");
  const [editNotes, setEditNotes] = useState(row.notes ?? "");
  const [editDone, setEditDone] = useState(row.status === "DONE");

  const displayLabel =
    row.rowType === "LEVEL"
      ? `${row.level}`
      : null; // non-LEVEL rows use a colored dot instead

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        rowClasses(row),
        isDragging && "z-10 opacity-70 shadow-lg",
        "group"
      )}
    >
      {/* Collapsed row */}
      <div
        className={cn(
          "grid cursor-pointer items-center gap-1 px-2 py-1.5 text-sm hover:bg-muted/30",
          "grid-cols-[20px_40px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]",
          "sm:grid-cols-[20px_40px_minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]"
        )}
        onClick={onToggle}
      >
        {/* Drag handle (non-LEVEL) / status icon (LEVEL, auto-derived) */}
        <div className="flex items-center justify-center">
          {isDraggable ? (
            <button
              type="button"
              className="cursor-grab touch-none text-muted-foreground/40 hover:text-muted-foreground"
              {...attributes}
              {...listeners}
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="h-3.5 w-3.5" />
            </button>
          ) : (
            <StatusIcon status={row.status} rowType={row.rowType} />
          )}
        </div>

        {/* Level / colored dot */}
        <div className="flex items-center justify-center">
          {displayLabel ? (
            <span className="text-xs font-semibold tabular-nums">
              {displayLabel}
            </span>
          ) : (
            <span
              className={cn(
                "h-2.5 w-2.5 rounded-full",
                row.rowType === "DOWNTIME" && "bg-amber-500",
                row.rowType === "THEME" && "bg-purple-500",
                row.status !== "DONE" && "opacity-50"
              )}
            />
          )}
        </div>

        {/* Class label / name (hidden on mobile) */}
        <div className="hidden truncate text-xs sm:block">
          {row.rowType === "LEVEL"
            ? (row.classLabel || "")
            : (row.label || (row.rowType === "DOWNTIME" ? "Downtime Activity" : "Theme Feat"))}
        </div>

        {/* Features */}
        <div className="truncate text-xs">{row.features || ""}</div>

        {/* Spells (hidden on mobile) */}
        <div className="hidden truncate text-xs sm:block">{row.spells || ""}</div>

        {/* Notes */}
        <div className="truncate text-xs text-muted-foreground">
          {row.notes || ""}
        </div>
      </div>

      {/* Expanded edit form — mirrors table grid for WYSIWYG feel */}
      {isExpanded && (
        <div className="space-y-2 border-t border-border/50 bg-muted/10 px-2 py-2">
          {/* Inline fields matching table columns */}
          <div
            className={cn(
              "grid items-start gap-1",
              "grid-cols-[20px_40px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]",
              "sm:grid-cols-[20px_40px_minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]"
            )}
          >
            {/* Status + level columns */}
            <div />
            <div className="flex items-center justify-center pt-5">
              {row.rowType !== "LEVEL" && (
                <label className="relative flex cursor-pointer items-center" title={editDone ? "Marked as done" : "Mark as done"}>
                  <input
                    type="checkbox"
                    checked={editDone}
                    onChange={(e) => setEditDone(e.target.checked)}
                    className="peer sr-only"
                  />
                  <span
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded border transition-colors",
                      editDone
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-muted-foreground/40 hover:border-muted-foreground"
                    )}
                  >
                    {editDone && <Check className="h-3 w-3" />}
                  </span>
                </label>
              )}
            </div>

            {/* Class column: shows Class input for LEVEL rows, Label input for DT/TF rows */}
            <div className="hidden space-y-1 sm:block">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                {row.rowType === "LEVEL" ? "Class" : row.rowType === "DOWNTIME" ? "Downtime Activity" : "Theme Feat"}
              </Label>
              {row.rowType === "LEVEL" ? (
                <Input
                  value={editClassLabel}
                  onChange={(e) => setEditClassLabel(e.target.value)}
                  placeholder="Ranger 3"
                  className="h-8 text-sm"
                />
              ) : (
                <Input
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  placeholder={row.rowType === "DOWNTIME" ? "e.g. Alert Feat Training" : "e.g. Planar Sovereign"}
                  className="h-8 text-sm"
                />
              )}
            </div>

            {/* Features */}
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Features</Label>
              <Textarea
                value={editFeatures}
                onChange={(e) => setEditFeatures(e.target.value)}
                placeholder="Feats, ASIs..."
                rows={2}
                className="text-sm"
              />
            </div>

            {/* Spells */}
            <div className="hidden space-y-1 sm:block">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Spells</Label>
              <Textarea
                value={editSpells}
                onChange={(e) => setEditSpells(e.target.value)}
                placeholder="New spells..."
                rows={2}
                className="text-sm"
              />
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Notes</Label>
              <Textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Build notes..."
                rows={2}
                className="text-sm"
              />
            </div>
          </div>

          {/* Mobile-only: Class/Name + Spells (hidden on desktop where they're inline) */}
          <div className="grid grid-cols-2 gap-2 px-1 sm:hidden">
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                {row.rowType === "LEVEL" ? "Class" : row.rowType === "DOWNTIME" ? "Downtime Activity" : "Theme Feat"}
              </Label>
              {row.rowType === "LEVEL" ? (
                <Input
                  value={editClassLabel}
                  onChange={(e) => setEditClassLabel(e.target.value)}
                  placeholder="Ranger 3"
                  className="h-8 text-sm"
                />
              ) : (
                <Input
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  placeholder={row.rowType === "DOWNTIME" ? "e.g. Alert Feat Training" : "e.g. Planar Sovereign"}
                  className="h-8 text-sm"
                />
              )}
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Spells</Label>
              <Textarea
                value={editSpells}
                onChange={(e) => setEditSpells(e.target.value)}
                placeholder="New spells..."
                rows={2}
                className="text-sm"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 px-1">
            <Button
              size="sm"
              className="gap-1.5"
              disabled={saving}
              onClick={(e) => {
                e.stopPropagation();
                onSave({
                  ...(row.rowType !== "LEVEL"
                    ? {
                        label: editLabel.trim() || null,
                        status: editDone ? "DONE" : "FUTURE",
                      }
                    : {}),
                  classLabel: editClassLabel.trim() || null,
                  features: editFeatures.trim() || null,
                  spells: editSpells.trim() || null,
                  notes: editNotes.trim() || null,
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

            {row.rowType !== "LEVEL" && (
              <Button
                size="sm"
                variant="ghost"
                className="gap-1.5 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main table ──

function deriveLevelStatuses(rows: ProgressionRow[], level: number | null): ProgressionRow[] {
  const charLevel = level ?? 0;
  return rows.map((r) => {
    if (r.rowType !== "LEVEL" || r.level == null) return r;
    const status: ProgressionRow["status"] =
      r.level < charLevel ? "DONE" : r.level === charLevel ? "CURRENT" : "FUTURE";
    return status !== r.status ? { ...r, status } : r;
  });
}

export function ProgressionTable({ rows: initialRows, profileId, characterLevel }: ProgressionTableProps) {
  const [rows, setRows] = useState(() => deriveLevelStatuses(initialRows, characterLevel));
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  // ── Drag end ──
  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const activeRow = rows.find((r) => r.id === active.id);
      if (!activeRow || activeRow.rowType === "LEVEL") return;

      const oldIndex = rows.findIndex((r) => r.id === active.id);
      const newIndex = rows.findIndex((r) => r.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      // Compute new sortOrder
      let newSortOrder: number;
      const sorted = [...rows].sort((a, b) => a.sortOrder - b.sortOrder);
      const targetIdx = sorted.findIndex((r) => r.id === over.id);

      if (newIndex < oldIndex) {
        // Moving up — place before target
        const before = targetIdx > 0 ? sorted[targetIdx - 1].sortOrder : 0;
        const after = sorted[targetIdx].sortOrder;
        newSortOrder = (before + after) / 2;
      } else {
        // Moving down — place after target
        const before = sorted[targetIdx].sortOrder;
        const after = targetIdx < sorted.length - 1 ? sorted[targetIdx + 1].sortOrder : before + 1;
        newSortOrder = (before + after) / 2;
      }

      // Optimistic update
      const updated = rows.map((r) =>
        r.id === active.id ? { ...r, sortOrder: newSortOrder } : r
      );
      updated.sort((a, b) => a.sortOrder - b.sortOrder);
      setRows(updated);

      await reorderProgressionRow(active.id as string, newSortOrder);
    },
    [rows]
  );

  // ── Row actions ──
  const handleToggle = useCallback(
    (id: string) => setExpandedId((prev) => (prev === id ? null : id)),
    []
  );

  const handleSave = useCallback(
    async (id: string, data: Partial<ProgressionRow>) => {
      setSavingId(id);
      try {
        await updateProgressionRow(id, {
          label: data.label,
          classLabel: data.classLabel,
          features: data.features,
          spells: data.spells,
          notes: data.notes,
          ...(data.status ? { status: data.status } : {}),
        });
        // Update local state
        setRows((prev) =>
          prev.map((r) => (r.id === id ? { ...r, ...data } : r))
        );
        setExpandedId(null);
      } catch (err) {
        console.error("Failed to save row:", err);
      } finally {
        setSavingId(null);
      }
    },
    []
  );

  const handleDelete = useCallback(
    async (id: string) => {
      setRows((prev) => prev.filter((r) => r.id !== id));
      setExpandedId(null);
      await deleteProgressionRow(id);
    },
    []
  );

  const handleAddRow = useCallback(
    async (rowType: "DOWNTIME" | "THEME") => {
      const label = "";
      const newRow = await addProgressionRow(profileId, rowType, label);
      setRows((prev) =>
        [
          ...prev,
          {
            id: newRow.id,
            rowType: newRow.rowType as "LEVEL" | "DOWNTIME" | "THEME",
            level: newRow.level,
            label: newRow.label,
            classLabel: newRow.classLabel,
            features: newRow.features,
            spells: newRow.spells,
            notes: newRow.notes,
            status: newRow.status as "DONE" | "CURRENT" | "FUTURE",
            sortOrder: newRow.sortOrder,
          },
        ].sort((a, b) => a.sortOrder - b.sortOrder)
      );
      setExpandedId(newRow.id);
    },
    [profileId]
  );

  const sortedRows = [...rows].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <Card>
      <CardContent className="p-0">
        {/* Header */}
        <div
          className={cn(
            "grid items-center gap-1 border-b border-border px-2 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60",
            "grid-cols-[20px_40px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]",
            "sm:grid-cols-[20px_40px_minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]"
          )}
        >
          <div />
          <div>Lv</div>
          <div className="hidden sm:block">Class</div>
          <div>Features</div>
          <div className="hidden sm:block">Spells</div>
          <div>Notes</div>
        </div>

        {/* Rows */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedRows.map((r) => r.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="divide-y divide-border/30">
              {sortedRows.map((row) => (
                <SortableRow
                  key={row.id}
                  row={row}
                  isExpanded={expandedId === row.id}
                  onToggle={() => handleToggle(row.id)}
                  onSave={(data) => handleSave(row.id, data)}
                  onDelete={() => handleDelete(row.id)}
                  saving={savingId === row.id}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* Legend + Add Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-3 py-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground/60">
            <span className="flex items-center gap-1">
              <Check className="h-3 w-3 text-emerald-500" /> Done
            </span>
            <span className="flex items-center gap-1">
              <Circle className="h-2.5 w-2.5 fill-blue-500 text-blue-500" /> Current
            </span>
            <span className="border-l border-border/50 pl-3 flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500 opacity-50" /> Downtime (planned)
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Downtime (done)
            </span>
            <span className="border-l border-border/50 pl-3 flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-purple-500 opacity-50" /> Theme Feat (planned)
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-purple-500" /> Theme Feat (done)
            </span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
              <Plus className="h-3.5 w-3.5" />
              Add Row
              <ChevronDown className="h-3 w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleAddRow("DOWNTIME")}>
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-amber-500" />
                Downtime Activity
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddRow("THEME")}>
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-purple-500" />
                Theme Feat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
