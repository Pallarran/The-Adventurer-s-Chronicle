"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { LocationListItem, LocationDetail } from "@/types";
import { plainJson } from "@/lib/plain-json";
import { createEntityActions } from "@/lib/actions/entity-factory";
import {
  locationCreateSchema,
  locationUpdateSchema,
  type CreateLocationData,
  type UpdateLocationData,
} from "@/lib/validation/entities";

const locationListInclude = {
  parentLocation: { select: { id: true, name: true } },
  organizations: { include: { organization: { select: { id: true, name: true } } } },
  firstAppearanceSession: { select: { id: true, sessionNumber: true } },
  lastAppearanceSession: { select: { id: true, sessionNumber: true } },
} as const;

const locationDetailInclude = {
  parentLocation: { select: { id: true, name: true } },
  childLocations: { select: { id: true, name: true, type: true } },
  organizations: { include: { organization: { select: { id: true, name: true } } } },
  sessions: { include: { session: { select: { id: true, sessionNumber: true, title: true } } } },
  firstAppearanceSession: { select: { id: true, sessionNumber: true, title: true } },
  lastAppearanceSession: { select: { id: true, sessionNumber: true, title: true } },
  basedOrganizations: { select: { id: true, name: true } },
} as const;

interface LocationFilters {
  search?: string;
  type?: string;
  sortBy?: "name" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

export async function getLocations(campaignId: string, filters?: LocationFilters): Promise<LocationListItem[]> {
  const { search, type, sortBy = "name", sortOrder = "asc" } = filters ?? {};

  return prisma.location.findMany({
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
      ...(type ? { type: { contains: type, mode: "insensitive" as const } } : {}),
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

const locationActions = createEntityActions({
  label: "location",
  basePath: "/locations",
  delegate: prisma.location,
  createSchema: locationCreateSchema,
  updateSchema: locationUpdateSchema,
  performCreate: (data) =>
    prisma.location.create({
      data: {
        campaignId: data.campaignId,
        name: data.name,
        aliasTitle: data.aliasTitle,
        type: data.type,
        parentLocationId: data.parentLocationId || null,
        notesBody: plainJson(data.notesBody),
        mainImage: data.mainImage,
        organizations: data.organizationIds?.length
          ? { create: data.organizationIds.map((organizationId) => ({ organizationId })) }
          : undefined,
      },
    }),
  performUpdate: async (id, data) => {
    if (data.organizationIds !== undefined) {
      await prisma.locationOrganization.deleteMany({ where: { locationId: id } });
    }

    return prisma.location.update({
      where: { id, deletedAt: null },
      data: {
        name: data.name,
        aliasTitle: data.aliasTitle,
        type: data.type,
        parentLocationId: data.parentLocationId,
        notesBody: plainJson(data.notesBody),
        mainImage: data.mainImage,
        organizations: data.organizationIds?.length
          ? { create: data.organizationIds.map((organizationId) => ({ organizationId })) }
          : undefined,
      },
    });
  },
});

export async function createLocation(data: CreateLocationData) {
  return locationActions.create(data);
}

export async function updateLocation(id: string, data: UpdateLocationData) {
  return locationActions.update(id, data);
}

export async function deleteLocation(id: string) {
  return locationActions.softDelete(id);
}

export async function restoreLocation(id: string) {
  return locationActions.restore(id);
}

export async function purgeLocation(id: string) {
  return locationActions.purge(id);
}

export async function updateLocationImagePosition(id: string, positionY: number) {
  await prisma.location.update({
    where: { id },
    data: { imagePositionY: positionY },
  });
  revalidatePath("/locations");
  revalidatePath(`/locations/${id}`);
}
