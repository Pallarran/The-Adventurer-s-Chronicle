"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Plus } from "lucide-react";
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const activeCampaign = campaigns.find((c) => c.id === activeCampaignId);

  useEffect(() => {
    getCampaigns().then(setCampaigns);
  }, [activeCampaignId]);

  async function handleSwitch(campaignId: string) {
    setPopoverOpen(false);
    await setActiveCampaign(campaignId);
    router.refresh();
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreating(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    await createCampaign(name, description || undefined);
    setDialogOpen(false);
    setCreating(false);
    router.refresh();
  }

  if (campaigns.length === 0) {
    return (
      <div className="mx-3 mb-2 rounded-md border border-dashed border-border px-3 py-2">
        <span className="text-xs text-muted-foreground">No campaigns</span>
      </div>
    );
  }

  return (
    <>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger
          className="mx-3 mb-2 flex w-[calc(100%-1.5rem)] items-center gap-2 rounded-md border border-border bg-sidebar px-3 py-1.5 text-left text-sm hover:bg-accent transition-colors cursor-pointer"
        >
          <span className="flex-1 truncate font-medium text-foreground">
            {activeCampaign?.name ?? "Select campaign"}
          </span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </PopoverTrigger>

        <PopoverContent
          align="start"
          side="bottom"
          sideOffset={4}
          className="w-56 p-1"
        >
          {campaigns.map((campaign) => (
            <button
              key={campaign.id}
              onClick={() => handleSwitch(campaign.id)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent transition-colors text-left cursor-pointer"
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
          ))}

          <div className="my-1 h-px bg-border" />

          <button
            onClick={() => {
              setPopoverOpen(false);
              setDialogOpen(true);
            }}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent transition-colors text-left cursor-pointer text-muted-foreground"
          >
            <Plus className="h-3.5 w-3.5 shrink-0" />
            <span>New Campaign</span>
          </button>
        </PopoverContent>
      </Popover>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
              <Button type="submit" disabled={creating}>
                {creating ? "Creating..." : "Create Campaign"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
