"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Prisma, type CharacterSectionType } from "@/generated/prisma/client";

type JsonValue = Prisma.JsonValue;

export async function getCharacterProfile(campaignId: string) {
  return prisma.characterProfile.findUnique({
    where: { campaignId },
    include: { sections: true },
  });
}

export async function updateCharacterProfile(
  id: string,
  data: {
    name?: string;
    classInfo?: string | null;
    race?: string | null;
    level?: number | null;
    portrait?: string | null;
    summary?: string | null;
  }
) {
  const profile = await prisma.characterProfile.update({
    where: { id },
    data,
  });

  revalidatePath("/character");
  revalidatePath("/dashboard");
  return profile;
}

export async function getCharacterSection(
  profileId: string,
  type: CharacterSectionType
) {
  return prisma.characterSection.findUnique({
    where: { characterProfileId_type: { characterProfileId: profileId, type } },
  });
}

export async function updateCharacterSection(
  id: string,
  content: JsonValue
) {
  const section = await prisma.characterSection.update({
    where: { id },
    data: { content: content ?? Prisma.DbNull },
  });

  revalidatePath("/character");
  return section;
}
