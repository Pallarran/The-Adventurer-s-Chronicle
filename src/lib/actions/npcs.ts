"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { NpcStatus, AlignmentStance, Prisma } from "@/generated/prisma/client";
import type { NpcListItem, NpcDetail } from "@/types";
import { plainJson } from "@/lib/plain-json";

type JsonValue = Prisma.JsonValue;

const npcListInclude = {
  organization: { select: { id: true, name: true } },
  firstAppearanceSession: { select: { id: true, sessionNumber: true } },
  lastAppearanceSession: { select: { id: true, sessionNumber: true } },
} as const;

const npcDetailInclude = {
  organization: { select: { id: true, name: true } },
  sessions: { include: { session: { select: { id: true, sessionNumber: true, title: true } } } },
  organizations: { include: { organization: { select: { id: true, name: true } } } },
  firstAppearanceSession: { select: { id: true, sessionNumber: true, title: true } },
  lastAppearanceSession: { select: { id: true, sessionNumber: true, title: true } },
} as const;

interface NpcFilters {
  search?: string;
  status?: NpcStatus;
  alignmentStance?: AlignmentStance;
  organizationId?: string;
  partyMember?: boolean;
  sortBy?: "name" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

export async function getNpcs(campaignId: string, filters?: NpcFilters): Promise<NpcListItem[]> {
  const {
    search,
    status,
    organizationId,
    partyMember,
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
  alignmentStance?: AlignmentStance;
  partyMember?: boolean;
  organizationId?: string;
  notesBody?: JsonValue;
  mainImage?: string;
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
      alignmentStance: data.alignmentStance ?? "UNKNOWN",
      partyMember: data.partyMember ?? false,
      organizationId: data.organizationId || null,
      notesBody: plainJson(data.notesBody),
      mainImage: data.mainImage,
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
  alignmentStance?: AlignmentStance;
  partyMember?: boolean;
  organizationId?: string | null;
  notesBody?: JsonValue;
  mainImage?: string | null;
}

export async function updateNpc(id: string, data: UpdateNpcData) {
  const npc = await prisma.npc.update({
    where: { id, deletedAt: null },
    data: {
      name: data.name,
      aliasTitle: data.aliasTitle,
      gender: data.gender,
      classRole: data.classRole,
      race: data.race,
      status: data.status,
      alignmentStance: data.alignmentStance,
      partyMember: data.partyMember,
      organizationId: data.organizationId,
      notesBody: plainJson(data.notesBody),
      mainImage: data.mainImage,
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

export async function updateNpcImagePosition(id: string, positionY: number) {
  await prisma.npc.update({
    where: { id },
    data: { imagePositionY: positionY },
  });
  revalidatePath("/npcs");
  revalidatePath(`/npcs/${id}`);
}
