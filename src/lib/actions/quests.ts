"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Prisma, type QuestStatus } from "@/generated/prisma/client";
import type { QuestListItem, QuestDetail } from "@/types";
import { createEntityActions } from "@/lib/actions/entity-factory";
import { runDb, fail, type ActionResult } from "@/lib/action-result";
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
  statusChanges: {
    include: { session: { select: { id: true, sessionNumber: true, title: true } } },
    orderBy: { createdAt: "asc" },
  },
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

/** Open threads (Lead + Active) for the campaign — used by the session quest panel. */
export async function getOpenQuests(campaignId: string): Promise<QuestListItem[]> {
  return prisma.quest.findMany({
    where: {
      campaignId,
      deletedAt: null,
      status: { in: ["LEAD", "ACTIVE"] },
    },
    include: questListInclude,
    orderBy: [{ status: "asc" }, { name: "asc" }],
  }) as Promise<QuestListItem[]>;
}

/** Resolved threads (Completed + Failed) — surfaced behind the panel's "show resolved" toggle. */
export async function getResolvedQuests(campaignId: string): Promise<QuestListItem[]> {
  return prisma.quest.findMany({
    where: {
      campaignId,
      deletedAt: null,
      status: { in: ["COMPLETED", "FAILED"] },
    },
    include: questListInclude,
    orderBy: [{ status: "asc" }, { name: "asc" }],
  }) as Promise<QuestListItem[]>;
}

export async function getQuest(id: string): Promise<QuestDetail | null> {
  return prisma.quest.findUnique({
    where: { id, deletedAt: null },
    include: questDetailInclude,
  }) as Promise<QuestDetail | null>;
}

// ── Status-history helpers ────────────────────────────────────

type TxClient = Prisma.TransactionClient;

/**
 * Record a status transition with net-change-per-session coalescing: at most
 * one non-creation entry per (quest, session). A change that nets back to the
 * session's baseline deletes the entry; otherwise it updates the existing one.
 * Creation entries (fromStatus = null) are always inserted and never coalesced.
 */
async function recordStatusChange(
  tx: TxClient,
  args: {
    questId: string;
    from: QuestStatus | null;
    to: QuestStatus;
    sessionId?: string | null;
    note?: string | null;
  }
) {
  const sid = args.sessionId ?? null;

  // Creation entries always insert.
  if (args.from === null) {
    await tx.questStatusChange.create({
      data: { questId: args.questId, fromStatus: null, toStatus: args.to, sessionId: sid, note: args.note ?? null },
    });
    return;
  }

  const existing = await tx.questStatusChange.findFirst({
    where: { questId: args.questId, sessionId: sid, fromStatus: { not: null } },
    orderBy: { createdAt: "desc" },
  });

  if (existing) {
    if (args.to === existing.fromStatus) {
      await tx.questStatusChange.delete({ where: { id: existing.id } }); // net no-op → vanish
    } else {
      await tx.questStatusChange.update({
        where: { id: existing.id },
        data: { toStatus: args.to, ...(args.note != null ? { note: args.note } : {}) }, // keep baseline `fromStatus`
      });
    }
    return;
  }

  await tx.questStatusChange.create({
    data: { questId: args.questId, fromStatus: args.from, toStatus: args.to, sessionId: sid, note: args.note ?? null },
  });
}

/**
 * The session↔quest link is derived from history: a quest is "in" a session
 * iff it has at least one status-change/creation stamp there. Keep the
 * SessionQuest join in sync after recording (or removing) a stamp.
 */
async function syncSessionQuestLink(tx: TxClient, questId: string, sessionId: string) {
  const count = await tx.questStatusChange.count({ where: { questId, sessionId } });
  if (count > 0) {
    await tx.sessionQuest.upsert({
      where: { sessionId_questId: { sessionId, questId } },
      create: { sessionId, questId },
      update: {},
    });
  } else {
    await tx.sessionQuest.deleteMany({ where: { sessionId, questId } });
  }
}

// ── Factory-backed CRUD (create logs an origin entry; update logs status moves) ──

const questActions = createEntityActions({
  label: "quest",
  basePath: "/quests",
  delegate: prisma.quest,
  createSchema: questCreateSchema,
  updateSchema: questUpdateSchema,
  performCreate: (data) =>
    prisma.$transaction(async (tx) => {
      const status = data.status ?? "LEAD";
      const quest = await tx.quest.create({
        data: {
          campaignId: data.campaignId,
          name: data.name,
          description: data.description,
          status,
          questGiverNpcId: data.questGiverNpcId || null,
        },
      });
      const originSessionId = data.originSessionId || null;
      await recordStatusChange(tx, {
        questId: quest.id,
        from: null,
        to: status,
        sessionId: originSessionId,
      });
      // Created in a session → tie it to that session.
      if (originSessionId) await syncSessionQuestLink(tx, quest.id, originSessionId);
      return quest;
    }),
  performUpdate: (id, data) =>
    prisma.$transaction(async (tx) => {
      const current = await tx.quest.findUniqueOrThrow({
        where: { id },
        select: { status: true },
      });
      const quest = await tx.quest.update({
        where: { id, deletedAt: null },
        data: {
          name: data.name,
          description: data.description,
          status: data.status,
          questGiverNpcId: data.questGiverNpcId,
        },
      });
      // Status edits from the quest form log without a session.
      if (data.status !== undefined && data.status !== current.status) {
        await recordStatusChange(tx, {
          questId: id,
          from: current.status,
          to: data.status,
          sessionId: null,
        });
      }
      return quest;
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

// ── Dedicated, session-aware status flip ──────────────────────

/**
 * Single-purpose status change used by the quest cards and the session
 * surfaces. Records a status-history entry (stamped with the session when
 * the change happens while editing/viewing a session). No-op if unchanged.
 */
export async function setQuestStatus(
  questId: string,
  toStatus: QuestStatus,
  ctx?: { sessionId?: string | null; note?: string | null }
): Promise<ActionResult<{ id: string; status: QuestStatus }>> {
  if (!questId) return fail("Missing quest id.");

  const result = await runDb("update the quest status", () =>
    prisma.$transaction(async (tx) => {
      const current = await tx.quest.findUniqueOrThrow({
        where: { id: questId },
        select: { status: true },
      });
      if (current.status === toStatus) {
        return { id: questId, status: toStatus };
      }
      await tx.quest.update({
        where: { id: questId, deletedAt: null },
        data: { status: toStatus },
      });
      await recordStatusChange(tx, {
        questId,
        from: current.status,
        to: toStatus,
        sessionId: ctx?.sessionId ?? null,
        note: ctx?.note ?? null,
      });
      // Touching a quest's status in a session ties it to that session
      // (and reverting away — which removes the stamp — unties it).
      if (ctx?.sessionId) await syncSessionQuestLink(tx, questId, ctx.sessionId);
      return { id: questId, status: toStatus };
    })
  );

  if (result.ok) {
    revalidatePath("/quests");
    revalidatePath(`/quests/${questId}`);
    if (ctx?.sessionId) revalidatePath(`/sessions/${ctx.sessionId}`);
  }
  return result;
}

// ── Read helpers ──────────────────────────────────────────────

export async function getQuestStatusChangesForSession(sessionId: string) {
  return prisma.questStatusChange.findMany({
    where: { sessionId },
    include: { quest: { select: { id: true, name: true, deletedAt: true } } },
    orderBy: { createdAt: "asc" },
  });
}

export async function getQuestStatusCounts(campaignId: string) {
  const [active, leads] = await Promise.all([
    prisma.quest.count({ where: { campaignId, deletedAt: null, status: "ACTIVE" } }),
    prisma.quest.count({ where: { campaignId, deletedAt: null, status: "LEAD" } }),
  ]);
  return { active, leads };
}
