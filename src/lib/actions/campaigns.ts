"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const CAMPAIGN_COOKIE = "active-campaign-id";

export async function getCampaigns() {
  return prisma.campaign.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, description: true, createdAt: true },
  });
}

export async function createCampaign(name: string, description?: string) {
  const campaign = await prisma.$transaction(async (tx) => {
    const campaign = await tx.campaign.create({
      data: { name, description },
    });

    const profile = await tx.characterProfile.create({
      data: { name: "Your Character", campaignId: campaign.id },
    });

    await tx.characterSection.createMany({
      data: ["OVERVIEW", "BUILD", "BACKSTORY"].map((type) => ({
        type: type as "OVERVIEW" | "BUILD" | "BACKSTORY",
        characterProfileId: profile.id,
      })),
    });

    await tx.quickNote.create({
      data: { campaignId: campaign.id },
    });

    return campaign;
  });

  // Set as active campaign
  const cookieStore = await cookies();
  cookieStore.set(CAMPAIGN_COOKIE, campaign.id, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
  });

  revalidatePath("/", "layout");
  return campaign;
}

export async function setActiveCampaign(campaignId: string) {
  const cookieStore = await cookies();
  cookieStore.set(CAMPAIGN_COOKIE, campaignId, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });

  revalidatePath("/", "layout");
}

export async function softDeleteCampaign(campaignId: string) {
  await prisma.campaign.update({
    where: { id: campaignId },
    data: { deletedAt: new Date() },
  });

  // If this was the active campaign, clear the cookie
  const cookieStore = await cookies();
  const activeCampaignId = cookieStore.get(CAMPAIGN_COOKIE)?.value;
  if (activeCampaignId === campaignId) {
    cookieStore.delete(CAMPAIGN_COOKIE);
  }

  revalidatePath("/", "layout");
}
