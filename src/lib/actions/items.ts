"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@/generated/prisma/client";
import type { ItemListItem, ItemDetail } from "@/types";
import { plainJson } from "@/lib/plain-json";

type JsonValue = Prisma.JsonValue;

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

interface CreateItemData {
  campaignId: string;
  name: string;
  type?: string;
  rarity?: string;
  aura?: string;
  attunement?: boolean;
  sold?: boolean;
  notesBody?: JsonValue;
  mainImage?: string;
  acquiredInSessionId?: string;
}

export async function createItem(data: CreateItemData) {
  const item = await prisma.item.create({
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
  });

  revalidatePath("/items");
  return item;
}

interface UpdateItemData {
  name?: string;
  type?: string | null;
  rarity?: string | null;
  aura?: string | null;
  attunement?: boolean;
  sold?: boolean;
  notesBody?: JsonValue;
  mainImage?: string | null;
  acquiredInSessionId?: string | null;
}

export async function updateItem(id: string, data: UpdateItemData) {
  const item = await prisma.item.update({
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
  });

  revalidatePath("/items");
  revalidatePath(`/items/${id}`);
  return item;
}

export async function deleteItem(id: string) {
  await prisma.item.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  revalidatePath("/items");
  revalidatePath(`/items/${id}`);
}

export async function restoreItem(id: string) {
  await prisma.item.update({
    where: { id },
    data: { deletedAt: null },
  });
  revalidatePath("/items");
}

export async function purgeItem(id: string) {
  await prisma.item.delete({ where: { id } });
}

export async function updateItemImagePosition(id: string, positionY: number) {
  await prisma.item.update({
    where: { id },
    data: { imagePositionY: positionY },
  });
  revalidatePath("/items");
  revalidatePath(`/items/${id}`);
}
