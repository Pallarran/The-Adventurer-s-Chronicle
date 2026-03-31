"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";

type JsonValue = Prisma.JsonValue;

export async function getQuickNote(campaignId: string) {
  return prisma.quickNote.findFirst({
    where: { campaignId },
  });
}

export async function updateQuickNote(id: string, content: JsonValue) {
  const note = await prisma.quickNote.update({
    where: { id },
    data: { content: content ?? Prisma.DbNull },
  });

  revalidatePath("/dashboard");
  return note;
}
