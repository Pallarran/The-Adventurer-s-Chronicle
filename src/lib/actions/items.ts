"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@/generated/prisma/client";
import type { ItemListItem, ItemDetail } from "@/types";
import { plainJson } from "@/lib/plain-json";

type JsonValue = Prisma.JsonValue;

const itemListInclude = {
  tags: { include: { tag: true } },
} as const;

const itemDetailInclude = {
  tags: { include: { tag: true } },
} as const;

interface ItemFilters {
  search?: string;
  type?: string;
  rarity?: string;
  tagId?: string;
  sortBy?: "name" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

export async function getItems(campaignId: string, filters?: ItemFilters): Promise<ItemListItem[]> {
  const { search, type, rarity, tagId, sortBy = "name", sortOrder = "asc" } = filters ?? {};

  return prisma.item.findMany({
    where: {
      campaignId,
      deletedAt: null,
      ...(search ? { name: { contains: search, mode: "insensitive" as const } } : {}),
      ...(type ? { type: { contains: type, mode: "insensitive" as const } } : {}),
      ...(rarity ? { rarity } : {}),
      ...(tagId ? { tags: { some: { tagId } } } : {}),
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
  notesBody?: JsonValue;
  mainImage?: string;
  tagIds?: string[];
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
      notesBody: plainJson(data.notesBody),
      mainImage: data.mainImage,
      tags: data.tagIds?.length
        ? { create: data.tagIds.map((tagId) => ({ tagId })) }
        : undefined,
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
  notesBody?: JsonValue;
  mainImage?: string | null;
  tagIds?: string[];
}

export async function updateItem(id: string, data: UpdateItemData) {
  if (data.tagIds !== undefined) {
    await prisma.itemTag.deleteMany({ where: { itemId: id } });
  }

  const item = await prisma.item.update({
    where: { id, deletedAt: null },
    data: {
      name: data.name,
      type: data.type,
      rarity: data.rarity,
      aura: data.aura,
      attunement: data.attunement,
      notesBody: plainJson(data.notesBody),
      mainImage: data.mainImage,
      tags: data.tagIds?.length
        ? { create: data.tagIds.map((tagId) => ({ tagId })) }
        : undefined,
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
