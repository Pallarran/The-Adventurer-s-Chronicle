"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { AlignmentStance } from "@/generated/prisma/client";
import type { OrganizationListItem, OrganizationDetail } from "@/types";
import { plainJson } from "@/lib/plain-json";
import { createEntityActions } from "@/lib/actions/entity-factory";
import {
  organizationCreateSchema,
  organizationUpdateSchema,
  type CreateOrganizationData,
  type UpdateOrganizationData,
} from "@/lib/validation/entities";

const orgListInclude = {
  baseLocation: { select: { id: true, name: true } },
  npcs: { include: { npc: { select: { id: true, name: true } } } },
  firstAppearanceSession: { select: { id: true, sessionNumber: true } },
  lastAppearanceSession: { select: { id: true, sessionNumber: true } },
} as const;

const orgDetailInclude = {
  baseLocation: { select: { id: true, name: true } },
  npcs: { include: { npc: { select: { id: true, name: true, classRole: true } } } },
  locations: { include: { location: { select: { id: true, name: true } } } },
  sessions: { include: { session: { select: { id: true, sessionNumber: true, title: true } } } },
  primaryNpcs: { select: { id: true, name: true } },
  firstAppearanceSession: { select: { id: true, sessionNumber: true, title: true } },
  lastAppearanceSession: { select: { id: true, sessionNumber: true, title: true } },
} as const;

interface OrganizationFilters {
  search?: string;
  type?: string;
  alignmentStance?: AlignmentStance;
  sortBy?: "name" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

export async function getOrganizations(campaignId: string, filters?: OrganizationFilters): Promise<OrganizationListItem[]> {
  const { search, type, alignmentStance, sortBy = "name", sortOrder = "asc" } =
    filters ?? {};

  return prisma.organization.findMany({
    where: {
      campaignId,
      deletedAt: null,
      ...(search ? { name: { contains: search, mode: "insensitive" as const } } : {}),
      ...(type ? { type: { contains: type, mode: "insensitive" as const } } : {}),
      ...(alignmentStance ? { alignmentStance } : {}),
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

const organizationActions = createEntityActions({
  label: "organization",
  basePath: "/organizations",
  delegate: prisma.organization,
  createSchema: organizationCreateSchema,
  updateSchema: organizationUpdateSchema,
  performCreate: (data) =>
    prisma.organization.create({
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
      },
    }),
  performUpdate: async (id, data) => {
    if (data.npcIds !== undefined) {
      await prisma.organizationNpc.deleteMany({ where: { organizationId: id } });
    }

    return prisma.organization.update({
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
      },
    });
  },
});

export async function createOrganization(data: CreateOrganizationData) {
  return organizationActions.create(data);
}

export async function updateOrganization(id: string, data: UpdateOrganizationData) {
  return organizationActions.update(id, data);
}

export async function deleteOrganization(id: string) {
  return organizationActions.softDelete(id);
}

export async function restoreOrganization(id: string) {
  return organizationActions.restore(id);
}

export async function purgeOrganization(id: string) {
  return organizationActions.purge(id);
}

export async function updateOrganizationImagePosition(id: string, positionY: number) {
  await prisma.organization.update({
    where: { id },
    data: { imagePositionY: positionY },
  });
  revalidatePath("/organizations");
  revalidatePath(`/organizations/${id}`);
}
