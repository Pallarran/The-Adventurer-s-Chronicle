"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@/generated/prisma/client";
import type { SessionListItem, SessionDetail } from "@/types";

type JsonValue = Prisma.JsonValue;

const sessionInclude = {
  npcs: { include: { npc: { select: { id: true, name: true } } } },
  locations: { include: { location: { select: { id: true, name: true } } } },
  organizations: { include: { organization: { select: { id: true, name: true } } } },
  tags: { include: { tag: true } },
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
    where: { id },
    include: sessionInclude,
  }) as Promise<SessionDetail | null>;
}

interface CreateSessionData {
  campaignId: string;
  sessionNumber: number;
  title?: string;
  realDatePlayed: Date;
  inGameDate?: string;
  notesBody?: JsonValue;
  followUpActions?: JsonValue;
  npcIds?: string[];
  locationIds?: string[];
  organizationIds?: string[];
  tagIds?: string[];
}

export async function createSession(data: CreateSessionData) {
  const session = await prisma.session.create({
    data: {
      campaignId: data.campaignId,
      sessionNumber: data.sessionNumber,
      title: data.title,
      realDatePlayed: data.realDatePlayed,
      inGameDate: data.inGameDate,
      notesBody: data.notesBody ?? undefined,
      followUpActions: data.followUpActions ?? undefined,
      npcs: data.npcIds?.length
        ? { create: data.npcIds.map((npcId) => ({ npcId })) }
        : undefined,
      locations: data.locationIds?.length
        ? { create: data.locationIds.map((locationId) => ({ locationId })) }
        : undefined,
      organizations: data.organizationIds?.length
        ? { create: data.organizationIds.map((organizationId) => ({ organizationId })) }
        : undefined,
      tags: data.tagIds?.length
        ? { create: data.tagIds.map((tagId) => ({ tagId })) }
        : undefined,
    },
  });

  revalidatePath("/sessions");
  return session;
}

interface UpdateSessionData {
  sessionNumber?: number;
  title?: string;
  realDatePlayed?: Date;
  inGameDate?: string;
  notesBody?: JsonValue;
  followUpActions?: JsonValue;
  npcIds?: string[];
  locationIds?: string[];
  organizationIds?: string[];
  tagIds?: string[];
}

export async function updateSession(id: string, data: UpdateSessionData) {
  // Update relations by deleting and recreating
  await prisma.$transaction([
    prisma.sessionNpc.deleteMany({ where: { sessionId: id } }),
    prisma.sessionLocation.deleteMany({ where: { sessionId: id } }),
    prisma.sessionOrganization.deleteMany({ where: { sessionId: id } }),
    prisma.sessionTag.deleteMany({ where: { sessionId: id } }),
  ]);

  const session = await prisma.session.update({
    where: { id },
    data: {
      sessionNumber: data.sessionNumber,
      title: data.title,
      realDatePlayed: data.realDatePlayed,
      inGameDate: data.inGameDate,
      notesBody: data.notesBody ?? undefined,
      followUpActions: data.followUpActions ?? undefined,
      npcs: data.npcIds?.length
        ? { create: data.npcIds.map((npcId) => ({ npcId })) }
        : undefined,
      locations: data.locationIds?.length
        ? { create: data.locationIds.map((locationId) => ({ locationId })) }
        : undefined,
      organizations: data.organizationIds?.length
        ? { create: data.organizationIds.map((organizationId) => ({ organizationId })) }
        : undefined,
      tags: data.tagIds?.length
        ? { create: data.tagIds.map((tagId) => ({ tagId })) }
        : undefined,
    },
  });

  revalidatePath("/sessions");
  revalidatePath(`/sessions/${id}`);
  return session;
}

export async function deleteSession(id: string) {
  await prisma.session.delete({ where: { id } });
  revalidatePath("/sessions");
}
