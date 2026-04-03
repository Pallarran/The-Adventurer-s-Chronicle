import { prisma } from "./prisma";
import { cookies } from "next/headers";

const CAMPAIGN_COOKIE = "active-campaign-id";

/**
 * Get the active campaign. Checks cookie first, falls back to first campaign.
 * Returns null if no campaigns exist (instead of throwing).
 */
export async function getActiveCampaign() {
  const cookieStore = await cookies();
  const savedId = cookieStore.get(CAMPAIGN_COOKIE)?.value;

  // Try the saved campaign first
  if (savedId) {
    const campaign = await prisma.campaign.findFirst({
      where: { id: savedId, deletedAt: null },
    });
    if (campaign) return campaign;
  }

  // Fall back to the first non-deleted campaign
  const campaign = await prisma.campaign.findFirst({
    where: { deletedAt: null },
    orderBy: { createdAt: "asc" },
  });

  return campaign ?? null;
}
