"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { SessionListItem, SessionDetail } from "@/types";
import { plainJson } from "@/lib/plain-json";
import { fail, runDb, zodErrorMessage, type ActionResult } from "@/lib/action-result";
import {
  sessionCreateSchema,
  sessionUpdateSchema,
  type CreateSessionData,
  type UpdateSessionData,
} from "@/lib/validation/entities";
import {
  recomputeNpcAppearances,
  recomputeLocationAppearances,
  recomputeOrgAppearances,
} from "@/lib/actions/recompute-appearances";

const sessionInclude = {
  npcs: { include: { npc: { select: { id: true, name: true } } } },
  locations: { include: { location: { select: { id: true, name: true } } } },
  organizations: { include: { organization: { select: { id: true, name: true } } } },
  quests: { include: { quest: { select: { id: true, name: true, status: true, description: true } } } },
} as const;

interface SessionFilters {
  search?: string;
  sortBy?: "sessionNumber" | "realDatePlayed";
  sortOrder?: "asc" | "desc";
}

export async function getSessions(campaignId: string, filters?: SessionFilters): Promise<SessionListItem[]> {
  const { search, sortBy = "sessionNumber", sortOrder = "desc" } = filters ?? {};

  return prisma.session.findMany({
    where: {
      campaignId,
      deletedAt: null,
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" as const } },
              { sessionNumber: isNaN(Number(search)) ? undefined : Number(search) },
            ].filter(Boolean),
          }
        : {}),
    },
    include: sessionInclude,
    orderBy: { [sortBy]: sortOrder },
  }) as Promise<SessionListItem[]>;
}

export async function getSession(id: string): Promise<SessionDetail | null> {
  return prisma.session.findUnique({
    where: { id, deletedAt: null },
    include: sessionInclude,
  }) as Promise<SessionDetail | null>;
}

export async function createSession(
  input: CreateSessionData
): Promise<ActionResult<{ id: string }>> {
  const parsed = sessionCreateSchema.safeParse(input);
  if (!parsed.success) return fail(zodErrorMessage(parsed.error));
  const data = parsed.data;

  const result = await runDb("save the session", async () => {
    const session = await prisma.session.create({
      data: {
        campaignId: data.campaignId,
        sessionNumber: data.sessionNumber,
        title: data.title,
        realDatePlayed: data.realDatePlayed,
        inGameDate: data.inGameDate,
        notesBody: plainJson(data.notesBody),
        npcs: data.npcIds?.length
          ? { create: data.npcIds.map((npcId) => ({ npcId })) }
          : undefined,
        locations: data.locationIds?.length
          ? { create: data.locationIds.map((locationId) => ({ locationId })) }
          : undefined,
        organizations: data.organizationIds?.length
          ? { create: data.organizationIds.map((organizationId) => ({ organizationId })) }
          : undefined,
        // Quest links are owned by the quest actions (status-history stamps),
        // applied by the form's create-mode orchestration after this returns.
      },
    });

    // Recompute first/last appearance for linked entities
    await Promise.all([
      recomputeNpcAppearances(data.npcIds ?? []),
      recomputeLocationAppearances(data.locationIds ?? []),
      recomputeOrgAppearances(data.organizationIds ?? []),
    ]);

    return { id: session.id };
  });

  if (result.ok) revalidatePath("/sessions");
  return result;
}

export async function updateSession(
  id: string,
  input: UpdateSessionData
): Promise<ActionResult<{ id: string }>> {
  const parsed = sessionUpdateSchema.safeParse(input);
  if (!parsed.success) return fail(zodErrorMessage(parsed.error));
  const data = parsed.data;

  const result = await runDb("save the session", async () => {
    // Fetch OLD linked entity IDs before deleting junction records
    const [oldNpcs, oldLocations, oldOrgs] = await Promise.all([
      prisma.sessionNpc.findMany({ where: { sessionId: id }, select: { npcId: true } }),
      prisma.sessionLocation.findMany({ where: { sessionId: id }, select: { locationId: true } }),
      prisma.sessionOrganization.findMany({ where: { sessionId: id }, select: { organizationId: true } }),
    ]);

    // Update relations by deleting and recreating. Quest links are NOT
    // touched here — they're owned by the quest actions (status-history stamps).
    await prisma.$transaction([
      prisma.sessionNpc.deleteMany({ where: { sessionId: id } }),
      prisma.sessionLocation.deleteMany({ where: { sessionId: id } }),
      prisma.sessionOrganization.deleteMany({ where: { sessionId: id } }),
    ]);

    const session = await prisma.session.update({
      where: { id, deletedAt: null },
      data: {
        sessionNumber: data.sessionNumber,
        title: data.title,
        realDatePlayed: data.realDatePlayed,
        inGameDate: data.inGameDate,
        notesBody: plainJson(data.notesBody),
        npcs: data.npcIds?.length
          ? { create: data.npcIds.map((npcId) => ({ npcId })) }
          : undefined,
        locations: data.locationIds?.length
          ? { create: data.locationIds.map((locationId) => ({ locationId })) }
          : undefined,
        organizations: data.organizationIds?.length
          ? { create: data.organizationIds.map((organizationId) => ({ organizationId })) }
          : undefined,
      },
    });

    // Recompute first/last appearance for old + new entity IDs (union)
    const allNpcIds = [...new Set([...oldNpcs.map((n) => n.npcId), ...(data.npcIds ?? [])])];
    const allLocationIds = [...new Set([...oldLocations.map((l) => l.locationId), ...(data.locationIds ?? [])])];
    const allOrgIds = [...new Set([...oldOrgs.map((o) => o.organizationId), ...(data.organizationIds ?? [])])];
    await Promise.all([
      recomputeNpcAppearances(allNpcIds),
      recomputeLocationAppearances(allLocationIds),
      recomputeOrgAppearances(allOrgIds),
    ]);

    return { id: session.id };
  });

  if (result.ok) {
    revalidatePath("/sessions");
    revalidatePath(`/sessions/${id}`);
  }
  return result;
}

export async function getRecentSessions(campaignId: string, limit: number = 5) {
  return prisma.session.findMany({
    where: { campaignId, deletedAt: null },
    select: {
      id: true,
      sessionNumber: true,
      title: true,
      realDatePlayed: true,
      inGameDate: true,
      notesBody: true,
      summary: true,
    },
    orderBy: { sessionNumber: "desc" },
    take: limit,
  });
}

export async function getNextSessionNumber(campaignId: string): Promise<number> {
  const result = await prisma.session.aggregate({
    where: { campaignId, deletedAt: null },
    _max: { sessionNumber: true },
  });
  return (result._max.sessionNumber ?? 0) + 1;
}

export async function deleteSession(id: string): Promise<ActionResult<null>> {
  const result = await runDb("delete the session", async () => {
    // Fetch linked entity IDs before soft-delete
    const linked = await prisma.session.findUnique({
      where: { id },
      select: {
        npcs: { select: { npcId: true } },
        locations: { select: { locationId: true } },
        organizations: { select: { organizationId: true } },
      },
    });

    await prisma.session.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Recompute appearances (this session is now excluded as soft-deleted)
    if (linked) {
      await Promise.all([
        recomputeNpcAppearances(linked.npcs.map((n) => n.npcId)),
        recomputeLocationAppearances(linked.locations.map((l) => l.locationId)),
        recomputeOrgAppearances(linked.organizations.map((o) => o.organizationId)),
      ]);
    }

    return null;
  });

  if (result.ok) {
    revalidatePath("/sessions");
    revalidatePath(`/sessions/${id}`);
  }
  return result;
}

export async function restoreSession(id: string): Promise<ActionResult<null>> {
  const result = await runDb("restore the session", async () => {
    await prisma.session.update({
      where: { id },
      data: { deletedAt: null },
    });

    // Fetch linked entity IDs and recompute (this session is now included again)
    const linked = await prisma.session.findUnique({
      where: { id },
      select: {
        npcs: { select: { npcId: true } },
        locations: { select: { locationId: true } },
        organizations: { select: { organizationId: true } },
      },
    });

    if (linked) {
      await Promise.all([
        recomputeNpcAppearances(linked.npcs.map((n) => n.npcId)),
        recomputeLocationAppearances(linked.locations.map((l) => l.locationId)),
        recomputeOrgAppearances(linked.organizations.map((o) => o.organizationId)),
      ]);
    }

    return null;
  });

  if (result.ok) revalidatePath("/sessions");
  return result;
}

export async function purgeSession(id: string): Promise<ActionResult<null>> {
  return runDb("permanently delete the session", async () => {
    await prisma.session.delete({ where: { id } });
    return null;
  });
}
