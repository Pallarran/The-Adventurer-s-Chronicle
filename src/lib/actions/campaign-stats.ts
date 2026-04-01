"use server";

import { prisma } from "@/lib/prisma";
import { getActiveCampaign } from "@/lib/campaign";

export async function getCampaignStats(campaignId: string) {
  const [sessions, npcs, locations, organizations] = await Promise.all([
    prisma.session.count({ where: { campaignId, deletedAt: null } }),
    prisma.npc.count({ where: { campaignId, deletedAt: null } }),
    prisma.location.count({ where: { campaignId, deletedAt: null } }),
    prisma.organization.count({ where: { campaignId, deletedAt: null } }),
  ]);

  return { sessions, npcs, locations, organizations };
}

export async function getSidebarStats() {
  const campaign = await getActiveCampaign();
  return getCampaignStats(campaign.id);
}
