"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setActiveCampaign, createCampaign } from "@/lib/actions/campaigns";

interface Campaign {
  id: string;
  name: string;
  description: string | null;
}

export function CampaignList({
  campaigns,
  activeCampaignId,
}: {
  campaigns: Campaign[];
  activeCampaignId: string | null;
}) {
  const router = useRouter();
  const [switching, setSwitching] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  async function handleSelect(campaignId: string) {
    setSwitching(campaignId);
    await setActiveCampaign(campaignId);
    router.push("/dashboard");
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreating(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    await createCampaign(name, description || undefined);
    router.push("/dashboard");
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
      {campaigns.map((campaign) => (
        <button
          key={campaign.id}
          onClick={() => handleSelect(campaign.id)}
          disabled={switching !== null || creating}
          className="rounded-lg border border-border bg-card p-4 text-left hover:border-gold/40 hover:bg-accent/50 transition-colors cursor-pointer disabled:opacity-60 flex gap-3 items-start"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gold/10 ring-1 ring-gold/20">
            <ScrollText className="h-4 w-4 text-gold" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-foreground truncate">
              {switching === campaign.id ? "Loading..." : campaign.name}
            </h3>
            {campaign.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {campaign.description}
              </p>
            )}
            {campaign.id === activeCampaignId && (
              <span className="text-[10px] font-medium text-gold mt-1 inline-block">
                Currently active
              </span>
            )}
          </div>
        </button>
      ))}

      {/* Create new campaign card */}
      <div className="rounded-lg border border-dashed border-border/60 p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-dashed border-muted-foreground/30">
            <Plus className="h-4 w-4 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">
            {campaigns.length === 0 ? "Create Your First Campaign" : "New Campaign"}
          </h3>
        </div>
        <form onSubmit={handleCreate} className="space-y-2">
          <Input
            name="name"
            placeholder="Campaign name"
            required
            minLength={1}
            maxLength={100}
            className="h-8 text-sm"
          />
          <Input
            name="description"
            placeholder="Description (optional)"
            maxLength={200}
            className="h-8 text-sm"
          />
          <Button type="submit" size="sm" className="w-full" disabled={creating || switching !== null}>
            {creating ? "Creating..." : "Begin Adventure"}
          </Button>
        </form>
      </div>
    </div>
  );
}
