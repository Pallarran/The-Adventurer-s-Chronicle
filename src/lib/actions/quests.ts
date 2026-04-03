"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { QuestStatus } from "@/generated/prisma/client";
import type { QuestListItem, QuestDetail } from "@/types";

const questListInclude = {
  sessions: { include: { session: { select: { id: true, sessionNumber: true } } } },
} as const;

const questDetailInclude = {
  sessions: { include: { session: { select: { id: true, sessionNumber: true, title: true } } } },
} as const;

interface QuestFilters {
  search?: string;
  status?: QuestStatus;
  sortBy?: "name" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

export async function getQuests(campaignId: string, filters?: QuestFilters): Promise<QuestListItem[]> {
  const { search, status, sortBy = "name", sortOrder = "asc" } = filters ?? {};

  return prisma.quest.findMany({
    where: {
      campaignId,
      deletedAt: null,
      ...(search ? { name: { contains: search, mode: "insensitive" as const } } : {}),
      ...(status ? { status } : {}),
    },
    include: questListInclude,
    orderBy: { [sortBy]: sortOrder },
  }) as Promise<QuestListItem[]>;
}

export async function getQuest(id: string): Promise<QuestDetail | null> {
  return prisma.quest.findUnique({
    where: { id, deletedAt: null },
    include: questDetailInclude,
  }) as Promise<QuestDetail | null>;
}

interface CreateQuestData {
  campaignId: string;
  name: string;
  description?: string;
  status?: QuestStatus;
}

export async function createQuest(data: CreateQuestData) {
  const quest = await prisma.quest.create({
    data: {
      campaignId: data.campaignId,
      name: data.name,
      description: data.description,
      status: data.status ?? "LEAD",
    },
  });

  revalidatePath("/quests");
  return quest;
}

interface UpdateQuestData {
  name?: string;
  description?: string | null;
  status?: QuestStatus;
}

export async function updateQuest(id: string, data: UpdateQuestData) {
  const quest = await prisma.quest.update({
    where: { id, deletedAt: null },
    data: {
      name: data.name,
      description: data.description,
      status: data.status,
    },
  });

  revalidatePath("/quests");
  revalidatePath(`/quests/${id}`);
  return quest;
}

export async function deleteQuest(id: string) {
  await prisma.quest.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  revalidatePath("/quests");
  revalidatePath(`/quests/${id}`);
}

export async function restoreQuest(id: string) {
  await prisma.quest.update({
    where: { id },
    data: { deletedAt: null },
  });
  revalidatePath("/quests");
}

export async function purgeQuest(id: string) {
  await prisma.quest.delete({ where: { id } });
}

export async function getQuestStatusCounts(campaignId: string) {
  const [active, leads] = await Promise.all([
    prisma.quest.count({ where: { campaignId, deletedAt: null, status: "ACTIVE" } }),
    prisma.quest.count({ where: { campaignId, deletedAt: null, status: "LEAD" } }),
  ]);
  return { active, leads };
}
