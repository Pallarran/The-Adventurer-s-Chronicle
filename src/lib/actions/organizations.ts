"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { AlignmentStance, Prisma } from "@/generated/prisma/client";
import type { OrganizationListItem, OrganizationDetail } from "@/types";
import { plainJson } from "@/lib/plain-json";

type JsonValue = Prisma.JsonValue;

const orgListInclude = {
  baseLocation: { select: { id: true, name: true } },
  npcs: { include: { npc: { select: { id: true, name: true } } } },
  tags: { include: { tag: true } },
  firstAppearanceSession: { select: { id: true, sessionNumber: true } },
  lastAppearanceSession: { select: { id: true, sessionNumber: true } },
} as const;

const orgDetailInclude = {
  baseLocation: { select: { id: true, name: true } },
  npcs: { include: { npc: { select: { id: true, name: true, classRole: true } } } },
  locations: { include: { location: { select: { id: true, name: true } } } },
  sessions: { include: { session: { select: { id: true, sessionNumber: true, title: true } } } },
  tags: { include: { tag: true } },
  primaryNpcs: { select: { id: true, name: true } },
  firstAppearanceSession: { select: { id: true, sessionNumber: true, title: true } },
  lastAppearanceSession: { select: { id: true, sessionNumber: true, title: true } },
} as const;

interface OrganizationFilters {
  search?: string;
  type?: string;
  alignmentStance?: AlignmentStance;
  tagId?: string;
  sortBy?: "name" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

export async function getOrganizations(campaignId: string, filters?: OrganizationFilters): Promise<OrganizationListItem[]> {
  const { search, type, alignmentStance, tagId, sortBy = "name", sortOrder = "asc" } =
    filters ?? {};

  return prisma.organization.findMany({
    where: {
      campaignId,
      deletedAt: null,
      ...(search ? { name: { contains: search, mode: "insensitive" as const } } : {}),
      ...(type ? { type: { contains: type, mode: "insensitive" as const } } : {}),
      ...(alignmentStance ? { alignmentStance } : {}),
      ...(tagId ? { tags: { some: { tagId } } } : {}),
    },
    include: orgListInclude,
    orderBy: { [sortBy]: sortOrder },
  }) as Promise<OrganizationListItem[]>;
}

export async function getOrganization(id: string): Promise<OrganizationDetail | null> {
  return prisma.organization.findUnique({
    where: { id, deletedAt: null },
    include: orgDetailInclude,
  }) as Promise<OrganizationDetail | null>;
}

interface CreateOrganizationData {
  campaignId: string;
  name: string;
  type?: string;
  alignmentStance?: AlignmentStance;
  baseLocationId?: string;
  notesBody?: JsonValue;
  mainImage?: string;
  npcIds?: string[];
  tagIds?: string[];
}

export async function createOrganization(data: CreateOrganizationData) {
  const org = await prisma.organization.create({
    data: {
      campaignId: data.campaignId,
      name: data.name,
      type: data.type,
      alignmentStance: data.alignmentStance ?? "UNKNOWN",
      baseLocationId: data.baseLocationId || null,
      notesBody: plainJson(data.notesBody),
      mainImage: data.mainImage,
      npcs: data.npcIds?.length
        ? { create: data.npcIds.map((npcId) => ({ npcId })) }
        : undefined,
      tags: data.tagIds?.length
        ? { create: data.tagIds.map((tagId) => ({ tagId })) }
        : undefined,
    },
  });

  revalidatePath("/organizations");
  return org;
}

interface UpdateOrganizationData {
  name?: string;
  type?: string;
  alignmentStance?: AlignmentStance;
  baseLocationId?: string | null;
  notesBody?: JsonValue;
  mainImage?: string | null;
  npcIds?: string[];
  tagIds?: string[];
}

export async function updateOrganization(id: string, data: UpdateOrganizationData) {
  const deletes = [];
  if (data.tagIds !== undefined) {
    deletes.push(prisma.organizationTag.deleteMany({ where: { organizationId: id } }));
  }
  if (data.npcIds !== undefined) {
    deletes.push(prisma.organizationNpc.deleteMany({ where: { organizationId: id } }));
  }
  if (deletes.length) await prisma.$transaction(deletes);

  const org = await prisma.organization.update({
    where: { id, deletedAt: null },
    data: {
      name: data.name,
      type: data.type,
      alignmentStance: data.alignmentStance,
      baseLocationId: data.baseLocationId,
      notesBody: plainJson(data.notesBody),
      mainImage: data.mainImage,
      npcs: data.npcIds?.length
        ? { create: data.npcIds.map((npcId) => ({ npcId })) }
        : undefined,
      tags: data.tagIds?.length
        ? { create: data.tagIds.map((tagId) => ({ tagId })) }
        : undefined,
    },
  });

  revalidatePath("/organizations");
  revalidatePath(`/organizations/${id}`);
  return org;
}

export async function deleteOrganization(id: string) {
  await prisma.organization.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  revalidatePath("/organizations");
  revalidatePath(`/organizations/${id}`);
}

export async function restoreOrganization(id: string) {
  await prisma.organization.update({
    where: { id },
    data: { deletedAt: null },
  });
  revalidatePath("/organizations");
}

export async function purgeOrganization(id: string) {
  await prisma.organization.delete({ where: { id } });
}

export async function updateOrganizationImagePosition(id: string, positionY: number) {
  await prisma.organization.update({
    where: { id },
    data: { imagePositionY: positionY },
  });
  revalidatePath("/organizations");
  revalidatePath(`/organizations/${id}`);
}
