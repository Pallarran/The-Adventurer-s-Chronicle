"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getToolLinks(campaignId: string) {
  return prisma.toolLink.findMany({
    where: { campaignId },
    orderBy: { name: "asc" },
  });
}

export async function createToolLink(data: {
  campaignId: string;
  name: string;
  url: string;
  icon?: string;
  category?: string;
  pinnedToDashboard?: boolean;
}) {
  const tool = await prisma.toolLink.create({ data });

  revalidatePath("/tools");
  revalidatePath("/dashboard");
  return tool;
}

export async function updateToolLink(
  id: string,
  data: {
    name?: string;
    url?: string;
    icon?: string | null;
    category?: string | null;
    pinnedToDashboard?: boolean;
  }
) {
  const tool = await prisma.toolLink.update({
    where: { id },
    data,
  });

  revalidatePath("/tools");
  revalidatePath("/dashboard");
  return tool;
}

export async function deleteToolLink(id: string) {
  await prisma.toolLink.delete({ where: { id } });
  revalidatePath("/tools");
  revalidatePath("/dashboard");
}
