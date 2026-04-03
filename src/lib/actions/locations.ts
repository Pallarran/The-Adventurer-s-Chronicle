"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@/generated/prisma/client";
import type { LocationListItem, LocationDetail } from "@/types";
import { plainJson } from "@/lib/plain-json";

type JsonValue = Prisma.JsonValue;

const locationListInclude = {
  parentLocation: { select: { id: true, name: true } },
  tags: { include: { tag: true } },
  organizations: { include: { organization: { select: { id: true, name: true } } } },
  firstAppearanceSession: { select: { id: true, sessionNumber: true } },
  lastAppearanceSession: { select: { id: true, sessionNumber: true } },
} as const;

const locationDetailInclude = {
  parentLocation: { select: { id: true, name: true } },
  childLocations: { select: { id: true, name: true, type: true } },
  tags: { include: { tag: true } },
  organizations: { include: { organization: { select: { id: true, name: true } } } },
  sessions: { include: { session: { select: { id: true, sessionNumber: true, title: true } } } },
  firstAppearanceSession: { select: { id: true, sessionNumber: true, title: true } },
  lastAppearanceSession: { select: { id: true, sessionNumber: true, title: true } },
  basedOrganizations: { select: { id: true, name: true } },
} as const;

interface LocationFilters {
  search?: string;
  type?: string;
  tagId?: string;
  sortBy?: "name" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

export async function getLocations(campaignId: string, filters?: LocationFilters): Promise<LocationListItem[]> {
  const { search, type, tagId, sortBy = "name", sortOrder = "asc" } = filters ?? {};

  return prisma.location.findMany({
    where: {
      campaignId,
      deletedAt: null,
      ...(search ? { name: { contains: search, mode: "insensitive" as const } } : {}),
      ...(type ? { type: { contains: type, mode: "insensitive" as const } } : {}),
      ...(tagId ? { tags: { some: { tagId } } } : {}),
    },
    include: locationListInclude,
    orderBy: { [sortBy]: sortOrder },
  }) as Promise<LocationListItem[]>;
}

export async function getLocation(id: string): Promise<LocationDetail | null> {
  return prisma.location.findUnique({
    where: { id, deletedAt: null },
    include: locationDetailInclude,
  }) as Promise<LocationDetail | null>;
}

interface CreateLocationData {
  campaignId: string;
  name: string;
  type?: string;
  parentLocationId?: string;
  notesBody?: JsonValue;
  mainImage?: string;
  organizationIds?: string[];
  tagIds?: string[];
}

export async function createLocation(data: CreateLocationData) {
  const location = await prisma.location.create({
    data: {
      campaignId: data.campaignId,
      name: data.name,
      type: data.type,
      parentLocationId: data.parentLocationId || null,
      notesBody: plainJson(data.notesBody),
      mainImage: data.mainImage,
      organizations: data.organizationIds?.length
        ? { create: data.organizationIds.map((organizationId) => ({ organizationId })) }
        : undefined,
      tags: data.tagIds?.length
        ? { create: data.tagIds.map((tagId) => ({ tagId })) }
        : undefined,
    },
  });

  revalidatePath("/locations");
  return location;
}

interface UpdateLocationData {
  name?: string;
  type?: string;
  parentLocationId?: string | null;
  notesBody?: JsonValue;
  mainImage?: string | null;
  organizationIds?: string[];
  tagIds?: string[];
}

export async function updateLocation(id: string, data: UpdateLocationData) {
  const deletes = [];
  if (data.tagIds !== undefined) {
    deletes.push(prisma.locationTag.deleteMany({ where: { locationId: id } }));
  }
  if (data.organizationIds !== undefined) {
    deletes.push(prisma.locationOrganization.deleteMany({ where: { locationId: id } }));
  }
  if (deletes.length) await prisma.$transaction(deletes);

  const location = await prisma.location.update({
    where: { id, deletedAt: null },
    data: {
      name: data.name,
      type: data.type,
      parentLocationId: data.parentLocationId,
      notesBody: plainJson(data.notesBody),
      mainImage: data.mainImage,
      organizations: data.organizationIds?.length
        ? { create: data.organizationIds.map((organizationId) => ({ organizationId })) }
        : undefined,
      tags: data.tagIds?.length
        ? { create: data.tagIds.map((tagId) => ({ tagId })) }
        : undefined,
    },
  });

  revalidatePath("/locations");
  revalidatePath(`/locations/${id}`);
  return location;
}

export async function deleteLocation(id: string) {
  await prisma.location.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  revalidatePath("/locations");
  revalidatePath(`/locations/${id}`);
}

export async function restoreLocation(id: string) {
  await prisma.location.update({
    where: { id },
    data: { deletedAt: null },
  });
  revalidatePath("/locations");
}

export async function purgeLocation(id: string) {
  await prisma.location.delete({ where: { id } });
}

export async function updateLocationImagePosition(id: string, positionY: number) {
  await prisma.location.update({
    where: { id },
    data: { imagePositionY: positionY },
  });
  revalidatePath("/locations");
  revalidatePath(`/locations/${id}`);
}
