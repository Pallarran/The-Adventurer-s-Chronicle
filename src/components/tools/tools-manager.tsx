"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Link2,
  ExternalLink,
  Plus,
  Pencil,
  Trash2,
  Pin,
} from "lucide-react";
import { ToolIcon } from "@/components/tools/tool-icon";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  createToolLink,
  updateToolLink,
  deleteToolLink,
} from "@/lib/actions/tools";

interface ToolLink {
  id: string;
  name: string;
  url: string;
  icon: string | null;
  category: string | null;
  pinnedToDashboard: boolean;
}

interface ToolsManagerProps {
  campaignId: string;
  initialTools: ToolLink[];
}

type FormData = {
  name: string;
  url: string;
  category: string;
  pinnedToDashboard: boolean;
};

const emptyForm: FormData = {
  name: "",
  url: "",
  category: "",
  pinnedToDashboard: false,
};

export function ToolsManager({ campaignId, initialTools }: ToolsManagerProps) {
  const router = useRouter();
  const [tools, setTools] = useState<ToolLink[]>(initialTools);
  const [isPending, startTransition] = useTransition();

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<ToolLink | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingTool, setDeletingTool] = useState<ToolLink | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function openAddDialog() {
    setEditingTool(null);
    setFormData(emptyForm);
    setDialogOpen(true);
  }

  function openEditDialog(tool: ToolLink) {
    setEditingTool(tool);
    setFormData({
      name: tool.name,
      url: tool.url,
      category: tool.category ?? "",
      pinnedToDashboard: tool.pinnedToDashboard,
    });
    setDialogOpen(true);
  }

  function openDeleteDialog(tool: ToolLink) {
    setDeletingTool(tool);
    setDeleteDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.name.trim() || !formData.url.trim()) return;

    const payload = {
      name: formData.name.trim(),
      url: formData.url.trim(),
      category: formData.category.trim() || undefined,
      pinnedToDashboard: formData.pinnedToDashboard,
    };

    if (editingTool) {
      // Optimistic update
      const optimisticTools = tools.map((t) =>
        t.id === editingTool.id
          ? {
              ...t,
              ...payload,
              category: payload.category ?? null,
            }
          : t
      );
      setTools(optimisticTools);
      setDialogOpen(false);

      startTransition(async () => {
        try {
          await updateToolLink(editingTool.id, payload);
          router.refresh();
        } catch {
          // Revert on error
          setTools(tools);
        }
      });
    } else {
      // Optimistic add with temporary id
      const tempId = `temp-${Date.now()}`;
      const optimisticTool: ToolLink = {
        id: tempId,
        name: payload.name,
        url: payload.url,
        icon: null,
        category: payload.category ?? null,
        pinnedToDashboard: payload.pinnedToDashboard,
      };
      const optimisticTools = [...tools, optimisticTool].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      setTools(optimisticTools);
      setDialogOpen(false);

      startTransition(async () => {
        try {
          const created = await createToolLink({
            campaignId,
            ...payload,
          });
          // Replace temp with real
          setTools((prev) =>
            prev
              .map((t) => (t.id === tempId ? { ...created, icon: created.icon ?? null, category: created.category ?? null } : t))
              .sort((a, b) => a.name.localeCompare(b.name))
          );
          router.refresh();
        } catch {
          // Revert on error
          setTools((prev) => prev.filter((t) => t.id !== tempId));
        }
      });
    }
  }

  async function handleDelete() {
    if (!deletingTool) return;

    setIsDeleting(true);
    const toolToDelete = deletingTool;

    // Optimistic remove
    const previousTools = tools;
    setTools((prev) => prev.filter((t) => t.id !== toolToDelete.id));
    setDeleteDialogOpen(false);
    setDeletingTool(null);

    startTransition(async () => {
      try {
        await deleteToolLink(toolToDelete.id);
        router.refresh();
      } catch {
        // Revert on error
        setTools(previousTools);
      } finally {
        setIsDeleting(false);
      }
    });
  }

  async function handleTogglePin(tool: ToolLink) {
    const newPinned = !tool.pinnedToDashboard;

    // Optimistic update
    const previousTools = tools;
    setTools((prev) =>
      prev.map((t) =>
        t.id === tool.id ? { ...t, pinnedToDashboard: newPinned } : t
      )
    );

    startTransition(async () => {
      try {
        await updateToolLink(tool.id, { pinnedToDashboard: newPinned });
        router.refresh();
      } catch {
        // Revert on error
        setTools(previousTools);
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Add button */}
      <div className="flex justify-end">
        <Button onClick={openAddDialog}>
          <Plus />
          Add Tool
        </Button>
      </div>

      {/* Tools list or empty state */}
      {tools.length === 0 ? (
        <EmptyState
          icon={Link2}
          title="No Tools Yet"
          description="Add links to your favorite tools and resources like Roll20, D&D Beyond, and campaign documents."
        >
          <Button onClick={openAddDialog}>
            <Plus />
            Add Your First Tool
          </Button>
        </EmptyState>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {tools.map((tool) => (
            <Card key={tool.id} size="sm">
              <CardContent className="space-y-3">
                {/* Header row: name + external link */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <ToolIcon url={tool.url} className="size-4 shrink-0 text-gold" />
                      <h3 className="truncate font-heading text-sm font-medium text-foreground">
                        {tool.name}
                      </h3>
                    </div>
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-arcane-teal"
                    >
                      <span className="truncate">{tool.url}</span>
                      <ExternalLink className="size-3 shrink-0" />
                    </a>
                  </div>
                </div>

                {/* Category badge + pin indicator */}
                <div className="flex items-center gap-2">
                  {tool.category && (
                    <Badge variant="secondary">{tool.category}</Badge>
                  )}
                  {tool.pinnedToDashboard && (
                    <span className="flex items-center gap-1 text-xs text-gold">
                      <Pin className="size-3" />
                      Pinned
                    </span>
                  )}
                </div>

                {/* Actions row */}
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor={`pin-${tool.id}`}
                      className="text-xs text-muted-foreground"
                    >
                      Dashboard
                    </Label>
                    <Switch
                      id={`pin-${tool.id}`}
                      size="sm"
                      checked={tool.pinnedToDashboard}
                      onCheckedChange={() => handleTogglePin(tool)}
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => openEditDialog(tool)}
                      aria-label={`Edit ${tool.name}`}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => openDeleteDialog(tool)}
                      aria-label={`Delete ${tool.name}`}
                    >
                      <Trash2 className="text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTool ? "Edit Tool" : "Add Tool"}
            </DialogTitle>
            <DialogDescription>
              {editingTool
                ? "Update the details for this tool link."
                : "Add a link to an external tool or resource."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tool-name">Name</Label>
              <Input
                id="tool-name"
                placeholder="D&D Beyond"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tool-url">URL</Label>
              <Input
                id="tool-url"
                type="url"
                placeholder="https://www.dndbeyond.com"
                required
                value={formData.url}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, url: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tool-category">Category</Label>
              <Input
                id="tool-category"
                placeholder="Character, Maps, Reference..."
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="tool-pinned">Pin to Dashboard</Label>
              <Switch
                id="tool-pinned"
                checked={formData.pinnedToDashboard}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    pinnedToDashboard: checked,
                  }))
                }
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? editingTool
                    ? "Saving..."
                    : "Adding..."
                  : editingTool
                    ? "Save Changes"
                    : "Add Tool"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Tool"
        description={`Are you sure you want to delete "${deletingTool?.name ?? ""}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </div>
  );
}
