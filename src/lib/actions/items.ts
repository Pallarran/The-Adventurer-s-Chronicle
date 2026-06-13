"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { ItemListItem, ItemDetail } from "@/types";
import { plainJson } from "@/lib/plain-json";
import { createEntityActions } from "@/lib/actions/entity-factory";
import {
  itemCreateSchema,
  itemUpdateSchema,
  type CreateItemData,
  type UpdateItemData,
} from "@/lib/validation/entities";

const itemListInclude = {
  acquiredInSession: { select: { id: true, sessionNumber: true, title: true } },
} as const;

const itemDetailInclude = {
  acquiredInSession: { select: { id: true, sessionNumber: true, title: true } },
} as const;

interface ItemFilters {
  search?: string;
  type?: string;
  rarity?: string;
  sortBy?: "name" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

export async function getItems(campaignId: string, filters?: ItemFilters): Promise<ItemListItem[]> {
  const { search, type, rarity, sortBy = "name", sortOrder = "asc" } = filters ?? {};

  return prisma.item.findMany({
    where: {
      campaignId,
      deletedAt: null,
      ...(search ? { name: { contains: search, mode: "insensitive" as const } } : {}),
      ...(type ? { type: { contains: type, mode: "insensitive" as const } } : {}),
      ...(rarity ? { rarity } : {}),
    },
    include: itemListInclude,
    orderBy: { [sortBy]: sortOrder },
  }) as Promise<ItemListItem[]>;
}

export async function getItem(id: string): Promise<ItemDetail | null> {
  return prisma.item.findUnique({
    where: { id, deletedAt: null },
    include: itemDetailInclude,
  }) as Promise<ItemDetail | null>;
}

const itemActions = createEntityActions({
  label: "item",
  basePath: "/items",
  delegate: prisma.item,
  createSchema: itemCreateSchema,
  updateSchema: itemUpdateSchema,
  performCreate: (data) =>
    prisma.item.create({
      data: {
        campaignId: data.campaignId,
        name: data.name,
        type: data.type,
        rarity: data.rarity,
        aura: data.aura,
        attunement: data.attunement ?? false,
        sold: data.sold ?? false,
        notesBody: plainJson(data.notesBody),
        mainImage: data.mainImage,
        acquiredInSessionId: data.acquiredInSessionId || null,
      },
    }),
  performUpdate: (id, data) =>
    prisma.item.update({
      where: { id, deletedAt: null },
      data: {
        name: data.name,
        type: data.type,
        rarity: data.rarity,
        aura: data.aura,
        attunement: data.attunement,
        sold: data.sold,
        notesBody: plainJson(data.notesBody),
        mainImage: data.mainImage,
        acquiredInSessionId: data.acquiredInSessionId,
      },
    }),
});

export async function createItem(data: CreateItemData) {
  return itemActions.create(data);
}

export async function updateItem(id: string, data: UpdateItemData) {
  return itemActions.update(id, data);
}

export async function deleteItem(id: string) {
  return itemActions.softDelete(id);
}

export async function restoreItem(id: string) {
  return itemActions.restore(id);
}

export async function purgeItem(id: string) {
  return itemActions.purge(id);
}

export async function updateItemImagePosition(id: string, positionY: number) {
  await prisma.item.update({
    where: { id },
    data: { imagePositionY: positionY },
  });
  revalidatePath("/items");
  revalidatePath(`/items/${id}`);
}
