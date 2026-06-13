"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { NpcStatus, AlignmentStance } from "@/generated/prisma/client";
import type { NpcListItem, NpcDetail } from "@/types";
import { plainJson } from "@/lib/plain-json";
import { createEntityActions } from "@/lib/actions/entity-factory";
import {
  npcCreateSchema,
  npcUpdateSchema,
  type CreateNpcData,
  type UpdateNpcData,
} from "@/lib/validation/entities";

const npcListInclude = {
  organization: { select: { id: true, name: true } },
  firstAppearanceSession: { select: { id: true, sessionNumber: true } },
  lastAppearanceSession: { select: { id: true, sessionNumber: true } },
} as const;

const npcDetailInclude = {
  organization: { select: { id: true, name: true } },
  currentLocation: { select: { id: true, name: true } },
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

const npcActions = createEntityActions({
  label: "NPC",
  basePath: "/npcs",
  delegate: prisma.npc,
  createSchema: npcCreateSchema,
  updateSchema: npcUpdateSchema,
  performCreate: (data) =>
    prisma.npc.create({
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
        currentLocationId: data.currentLocationId || null,
        notesBody: plainJson(data.notesBody),
        mainImage: data.mainImage,
      },
    }),
  performUpdate: (id, data) =>
    prisma.npc.update({
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
        currentLocationId: data.currentLocationId,
        notesBody: plainJson(data.notesBody),
        mainImage: data.mainImage,
      },
    }),
});

export async function createNpc(data: CreateNpcData) {
  return npcActions.create(data);
}

export async function updateNpc(id: string, data: UpdateNpcData) {
  return npcActions.update(id, data);
}

export async function deleteNpc(id: string) {
  return npcActions.softDelete(id);
}

export async function restoreNpc(id: string) {
  return npcActions.restore(id);
}

export async function purgeNpc(id: string) {
  return npcActions.purge(id);
}

export async function updateNpcImagePosition(id: string, positionY: number) {
  await prisma.npc.update({
    where: { id },
    data: { imagePositionY: positionY },
  });
  revalidatePath("/npcs");
  revalidatePath(`/npcs/${id}`);
}
