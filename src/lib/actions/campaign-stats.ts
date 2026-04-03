"use server";

import { prisma } from "@/lib/prisma";
import { getActiveCampaign } from "@/lib/campaign";

export async function getCampaignStats(campaignId: string) {
  const [sessions, npcs, locations, organizations, items, quests] = await Promise.all([
    prisma.session.count({ where: { campaignId, deletedAt: null } }),
    prisma.npc.count({ where: { campaignId, deletedAt: null } }),
    prisma.location.count({ where: { campaignId, deletedAt: null } }),
    prisma.organization.count({ where: { campaignId, deletedAt: null } }),
    prisma.item.count({ where: { campaignId, deletedAt: null } }),
    prisma.quest.count({ where: { campaignId, deletedAt: null } }),
  ]);

  return { sessions, npcs, locations, organizations, items, quests };
}

export async function getSidebarStats() {
  const campaign = await getActiveCampaign();
  if (!campaign) return { sessions: 0, npcs: 0, locations: 0, organizations: 0, items: 0, quests: 0 };
  return getCampaignStats(campaign.id);
}
