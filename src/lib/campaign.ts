import { prisma } from "./prisma";

export async function getActiveCampaign() {
  const campaign = await prisma.campaign.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (!campaign) {
    throw new Error("No campaign found. Please run the seed script.");
  }

  return campaign;
}
