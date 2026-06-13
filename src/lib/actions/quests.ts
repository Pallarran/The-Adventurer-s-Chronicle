"use server";

import { prisma } from "@/lib/prisma";
import type { QuestStatus } from "@/generated/prisma/client";
import type { QuestListItem, QuestDetail } from "@/types";
import { createEntityActions } from "@/lib/actions/entity-factory";
import {
  questCreateSchema,
  questUpdateSchema,
  type CreateQuestData,
  type UpdateQuestData,
} from "@/lib/validation/entities";

const questListInclude = {
  sessions: { include: { session: { select: { id: true, sessionNumber: true } } } },
} as const;

const questDetailInclude = {
  questGiver: { select: { id: true, name: true } },
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

const questActions = createEntityActions({
  label: "quest",
  basePath: "/quests",
  delegate: prisma.quest,
  createSchema: questCreateSchema,
  updateSchema: questUpdateSchema,
  performCreate: (data) =>
    prisma.quest.create({
      data: {
        campaignId: data.campaignId,
        name: data.name,
        description: data.description,
        status: data.status ?? "LEAD",
        questGiverNpcId: data.questGiverNpcId || null,
      },
    }),
  performUpdate: (id, data) =>
    prisma.quest.update({
      where: { id, deletedAt: null },
      data: {
        name: data.name,
        description: data.description,
        status: data.status,
        questGiverNpcId: data.questGiverNpcId,
      },
    }),
});

export async function createQuest(data: CreateQuestData) {
  return questActions.create(data);
}

export async function updateQuest(id: string, data: UpdateQuestData) {
  return questActions.update(id, data);
}

export async function deleteQuest(id: string) {
  return questActions.softDelete(id);
}

export async function restoreQuest(id: string) {
  return questActions.restore(id);
}

export async function purgeQuest(id: string) {
  return questActions.purge(id);
}

export async function getQuestStatusCounts(campaignId: string) {
  const [active, leads] = await Promise.all([
    prisma.quest.count({ where: { campaignId, deletedAt: null, status: "ACTIVE" } }),
    prisma.quest.count({ where: { campaignId, deletedAt: null, status: "LEAD" } }),
  ]);
  return { active, leads };
}
