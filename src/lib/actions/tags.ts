"use server";

import { prisma } from "@/lib/prisma";

export async function getTags(campaignId: string) {
  return prisma.tag.findMany({
    where: { campaignId },
    orderBy: { name: "asc" },
  });
}

export async function createTag(campaignId: string, name: string) {
  return prisma.tag.create({
    data: { name, campaignId },
  });
}

export async function deleteTag(id: string) {
  return prisma.tag.delete({ where: { id } });
}
