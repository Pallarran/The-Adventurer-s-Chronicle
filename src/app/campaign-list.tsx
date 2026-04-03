"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ScrollText } from "lucide-react";
import { setActiveCampaign } from "@/lib/actions/campaigns";

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

  async function handleSelect(campaignId: string) {
    setSwitching(campaignId);
    await setActiveCampaign(campaignId);
    router.push("/dashboard");
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
      {campaigns.map((campaign) => (
        <button
          key={campaign.id}
          onClick={() => handleSelect(campaign.id)}
          disabled={switching !== null}
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
    </div>
  );
}
