"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { NpcStatus, Prisma } from "@/generated/prisma/client";
import type { NpcListItem, NpcDetail } from "@/types";

type JsonValue = Prisma.JsonValue;

const npcListInclude = {
  organization: { select: { id: true, name: true } },
  tags: { include: { tag: true } },
  firstAppearanceSession: { select: { id: true, sessionNumber: true } },
  lastAppearanceSession: { select: { id: true, sessionNumber: true } },
} as const;

const npcDetailInclude = {
  organization: { select: { id: true, name: true } },
  sessions: { include: { session: { select: { id: true, sessionNumber: true, title: true } } } },
  organizations: { include: { organization: { select: { id: true, name: true } } } },
  tags: { include: { tag: true } },
  firstAppearanceSession: { select: { id: true, sessionNumber: true, title: true } },
  lastAppearanceSession: { select: { id: true, sessionNumber: true, title: true } },
} as const;

interface NpcFilters {
  search?: string;
  status?: NpcStatus;
  organizationId?: string;
  partyMember?: boolean;
  tagId?: string;
  sortBy?: "name" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

export async function getNpcs(campaignId: string, filters?: NpcFilters): Promise<NpcListItem[]> {
  const {
    search,
    status,
    organizationId,
    partyMember,
    tagId,
    sortBy = "name",
    sortOrder = "asc",
  } = filters ?? {};

  return prisma.npc.findMany({
    where: {
      campaignId,
      deletedAt: null,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { aliasTitle: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
      ...(status ? { status } : {}),
      ...(organizationId ? { organizationId } : {}),
      ...(partyMember !== undefined ? { partyMember } : {}),
      ...(tagId ? { tags: { some: { tagId } } } : {}),
    },
    include: npcListInclude,
    orderBy: { [sortBy]: sortOrder },
  }) as Promise<NpcListItem[]>;
}

export async function getNpc(id: string): Promise<NpcDetail | null> {
  return prisma.npc.findUnique({
    where: { id, deletedAt: null },
    include: npcDetailInclude,
  }) as Promise<NpcDetail | null>;
}

interface CreateNpcData {
  campaignId: string;
  name: string;
  aliasTitle?: string;
  gender?: string;
  classRole?: string;
  race?: string;
  status?: NpcStatus;
  partyMember?: boolean;
  organizationId?: string;
  firstAppearanceSessionId?: string;
  lastAppearanceSessionId?: string;
  notesBody?: JsonValue;
  mainImage?: string;
  tagIds?: string[];
}

export async function createNpc(data: CreateNpcData) {
  const npc = await prisma.npc.create({
    data: {
      campaignId: data.campaignId,
      name: data.name,
      aliasTitle: data.aliasTitle,
      gender: data.gender,
      classRole: data.classRole,
      race: data.race,
      status: data.status ?? "ALIVE",
      partyMember: data.partyMember ?? false,
      organizationId: data.organizationId || null,
      firstAppearanceSessionId: data.firstAppearanceSessionId || null,
      lastAppearanceSessionId: data.lastAppearanceSessionId || null,
      notesBody: data.notesBody ?? undefined,
      mainImage: data.mainImage,
      tags: data.tagIds?.length
        ? { create: data.tagIds.map((tagId) => ({ tagId })) }
        : undefined,
    },
  });

  revalidatePath("/npcs");
  return npc;
}

interface UpdateNpcData {
  name?: string;
  aliasTitle?: string;
  gender?: string;
  classRole?: string;
  race?: string;
  status?: NpcStatus;
  partyMember?: boolean;
  organizationId?: string | null;
  firstAppearanceSessionId?: string | null;
  lastAppearanceSessionId?: string | null;
  notesBody?: JsonValue;
  mainImage?: string | null;
  tagIds?: string[];
}

export async function updateNpc(id: string, data: UpdateNpcData) {
  if (data.tagIds !== undefined) {
    await prisma.npcTag.deleteMany({ where: { npcId: id } });
  }

  const npc = await prisma.npc.update({
    where: { id },
    data: {
      name: data.name,
      aliasTitle: data.aliasTitle,
      gender: data.gender,
      classRole: data.classRole,
      race: data.race,
      status: data.status,
      partyMember: data.partyMember,
      organizationId: data.organizationId,
      firstAppearanceSessionId: data.firstAppearanceSessionId,
      lastAppearanceSessionId: data.lastAppearanceSessionId,
      notesBody: data.notesBody ?? undefined,
      mainImage: data.mainImage,
      tags: data.tagIds?.length
        ? { create: data.tagIds.map((tagId) => ({ tagId })) }
        : undefined,
    },
  });

  revalidatePath("/npcs");
  revalidatePath(`/npcs/${id}`);
  return npc;
}

export async function deleteNpc(id: string) {
  await prisma.npc.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  revalidatePath("/npcs");
  revalidatePath(`/npcs/${id}`);
}

export async function restoreNpc(id: string) {
  await prisma.npc.update({
    where: { id },
    data: { deletedAt: null },
  });
  revalidatePath("/npcs");
}

export async function purgeNpc(id: string) {
  await prisma.npc.delete({ where: { id } });
}
