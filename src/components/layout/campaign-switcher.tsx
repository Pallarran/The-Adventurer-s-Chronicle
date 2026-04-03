"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Plus, Settings, Trash2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getCampaigns,
  setActiveCampaign,
  createCampaign,
  updateCampaign,
  softDeleteCampaign,
} from "@/lib/actions/campaigns";

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
}

export function CampaignSwitcher({
  activeCampaignId,
}: {
  activeCampaignId: string | null;
}) {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [saving, setSaving] = useState(false);

  const activeCampaign = campaigns.find((c) => c.id === activeCampaignId);

  useEffect(() => {
    getCampaigns().then(setCampaigns);
  }, [activeCampaignId]);

  async function handleSwitch(campaignId: string) {
    setPopoverOpen(false);
    await setActiveCampaign(campaignId);
    router.refresh();
  }

  function openEdit(campaign: Campaign, e: React.MouseEvent) {
    e.stopPropagation();
    setPopoverOpen(false);
    setEditingCampaign(campaign);
    setEditOpen(true);
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    await createCampaign(name, description || undefined);
    const fresh = await getCampaigns();
    setCampaigns(fresh);
    setCreateOpen(false);
    setSaving(false);
    router.refresh();
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingCampaign) return;
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    await updateCampaign(editingCampaign.id, name, description || undefined);
    const fresh = await getCampaigns();
    setCampaigns(fresh);
    setEditOpen(false);
    setEditingCampaign(null);
    setSaving(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!editingCampaign) return;
    setSaving(true);
    await softDeleteCampaign(editingCampaign.id);
    const fresh = await getCampaigns();
    setCampaigns(fresh);
    setEditOpen(false);
    setEditingCampaign(null);
    setSaving(false);
    router.refresh();
  }

  if (campaigns.length === 0) {
    return (
      <div className="mx-3 mb-1 rounded-md border border-dashed border-border px-3 py-2">
        <span className="text-xs text-muted-foreground">No campaigns</span>
      </div>
    );
  }

  return (
    <>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger
          className="mx-3 mb-1 flex w-[calc(100%-1.5rem)] items-center gap-2 rounded-md border border-sidebar-border bg-sidebar-accent/50 px-3 py-1.5 text-left text-sm hover:bg-accent transition-colors cursor-pointer"
        >
          <span className="flex-1 truncate text-xs font-medium text-muted-foreground">
            {activeCampaign?.name ?? "Select campaign"}
          </span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </PopoverTrigger>

        <PopoverContent
          align="start"
          side="bottom"
          sideOffset={4}
          className="w-[var(--radix-popover-trigger-width)] p-1"
        >
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="group flex items-center rounded-md hover:bg-accent transition-colors"
            >
              <button
                onClick={() => handleSwitch(campaign.id)}
                className="flex flex-1 items-center gap-2 px-2 py-1.5 text-sm text-left cursor-pointer min-w-0"
              >
                <Check
                  className={`h-3.5 w-3.5 shrink-0 ${
                    campaign.id === activeCampaignId
                      ? "text-gold"
                      : "text-transparent"
                  }`}
                />
                <span className="flex-1 truncate">{campaign.name}</span>
              </button>
              <button
                onClick={(e) => openEdit(campaign, e)}
                className="shrink-0 p-1.5 mr-1 rounded text-muted-foreground/0 group-hover:text-muted-foreground hover:!text-foreground transition-colors cursor-pointer"
                title="Edit campaign"
              >
                <Settings className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          <div className="my-1 h-px bg-border" />

          <button
            onClick={() => {
              setPopoverOpen(false);
              setCreateOpen(true);
            }}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent transition-colors text-left cursor-pointer text-muted-foreground"
          >
            <Plus className="h-3.5 w-3.5 shrink-0" />
            <span>New Campaign</span>
          </button>
        </PopoverContent>
      </Popover>

      {/* Create Campaign Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            <div className="space-y-3 py-2">
              <Input
                name="name"
                placeholder="Campaign name"
                required
                autoFocus
                minLength={1}
                maxLength={100}
              />
              <Input
                name="description"
                placeholder="Short description (optional)"
                maxLength={200}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={saving}>
                {saving ? "Creating..." : "Create Campaign"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Campaign Dialog */}
      <Dialog open={editOpen} onOpenChange={(open) => {
        setEditOpen(open);
        if (!open) setEditingCampaign(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Campaign</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate}>
            <div className="space-y-3 py-2">
              <Input
                name="name"
                placeholder="Campaign name"
                defaultValue={editingCampaign?.name ?? ""}
                required
                autoFocus
                minLength={1}
                maxLength={100}
                key={editingCampaign?.id}
              />
              <Input
                name="description"
                placeholder="Short description (optional)"
                defaultValue={editingCampaign?.description ?? ""}
                maxLength={200}
                key={`desc-${editingCampaign?.id}`}
              />
            </div>
            <DialogFooter className="flex-col gap-3 sm:flex-col">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="flex items-center justify-center gap-2 text-sm text-destructive hover:text-destructive/80 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete this campaign</span>
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
