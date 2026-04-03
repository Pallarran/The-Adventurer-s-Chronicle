"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  Prisma,
  type CharacterSectionType,
  type ProgressionRowType,
} from "@/generated/prisma/client";

type JsonValue = Prisma.JsonValue;

// ============================================================
// QUERIES
// ============================================================

export async function getCharacterProfile(campaignId: string) {
  return prisma.characterProfile.findUnique({
    where: { campaignId },
    include: { sections: true },
  });
}

export async function getCharacterSection(
  profileId: string,
  type: CharacterSectionType
) {
  return prisma.characterSection.findUnique({
    where: {
      characterProfileId_type: { characterProfileId: profileId, type },
    },
  });
}

export async function getProgressionRows(profileId: string) {
  let rows = await prisma.characterProgression.findMany({
    where: { characterProfileId: profileId },
    orderBy: { sortOrder: "asc" },
  });

  // Lazy init: create 20 LEVEL rows if none exist
  if (rows.length === 0) {
    const profile = await prisma.characterProfile.findUnique({
      where: { id: profileId },
      select: { level: true },
    });
    const currentLevel = profile?.level ?? 0;

    await prisma.characterProgression.createMany({
      data: Array.from({ length: 20 }, (_, i) => ({
        level: i + 1,
        rowType: "LEVEL" as const,
        label: null,
        sortOrder: i + 1,
        status:
          i + 1 < currentLevel
            ? ("DONE" as const)
            : i + 1 === currentLevel
              ? ("CURRENT" as const)
              : ("FUTURE" as const),
        characterProfileId: profileId,
      })),
    });

    rows = await prisma.characterProgression.findMany({
      where: { characterProfileId: profileId },
      orderBy: { sortOrder: "asc" },
    });
  }

  return rows;
}

// ============================================================
// PROFILE TAB SAVE
// ============================================================

export async function saveProfileTab(
  id: string,
  data: {
    name?: string;
    classInfo?: string | null;
    race?: string | null;
    level?: number | null;
    portrait?: string | null;
    backstoryContent?: JsonValue;
  }
) {
  const { backstoryContent, ...profileData } = data;

  await prisma.characterProfile.update({
    where: { id },
    data: profileData,
  });

  if (backstoryContent !== undefined) {
    await prisma.characterSection.upsert({
      where: {
        characterProfileId_type: {
          characterProfileId: id,
          type: "BACKSTORY",
        },
      },
      update: { content: backstoryContent ? JSON.parse(JSON.stringify(backstoryContent)) : Prisma.DbNull },
      create: {
        characterProfileId: id,
        type: "BACKSTORY",
        content: backstoryContent ? JSON.parse(JSON.stringify(backstoryContent)) : Prisma.DbNull,
      },
    });
  }

  // Sync LEVEL row statuses based on character level
  if (data.level !== undefined) {
    const characterLevel = data.level ?? 0;
    await Promise.all([
      prisma.characterProgression.updateMany({
        where: { characterProfileId: id, rowType: "LEVEL", level: { lt: characterLevel } },
        data: { status: "DONE" },
      }),
      prisma.characterProgression.updateMany({
        where: { characterProfileId: id, rowType: "LEVEL", level: characterLevel },
        data: { status: "CURRENT" },
      }),
      prisma.characterProgression.updateMany({
        where: { characterProfileId: id, rowType: "LEVEL", level: { gt: characterLevel } },
        data: { status: "FUTURE" },
      }),
    ]);
  }

  revalidatePath("/character");
  revalidatePath("/dashboard");
}

// ============================================================
// ROLEPLAY TAB SAVE
// ============================================================

export async function saveRoleplayTab(
  id: string,
  data: {
    personality?: string | null;
    ideals?: string | null;
    bonds?: string | null;
    flaws?: string | null;
    voiceMannerisms?: string | null;
    currentGoals?: string | null;
    fears?: string | null;
    overviewContent?: JsonValue;
  }
) {
  const { overviewContent, ...rpFields } = data;

  await prisma.characterProfile.update({
    where: { id },
    data: rpFields,
  });

  if (overviewContent !== undefined) {
    await prisma.characterSection.upsert({
      where: {
        characterProfileId_type: {
          characterProfileId: id,
          type: "OVERVIEW",
        },
      },
      update: { content: overviewContent ? JSON.parse(JSON.stringify(overviewContent)) : Prisma.DbNull },
      create: {
        characterProfileId: id,
        type: "OVERVIEW",
        content: overviewContent ? JSON.parse(JSON.stringify(overviewContent)) : Prisma.DbNull,
      },
    });
  }

  revalidatePath("/character");
  revalidatePath("/dashboard");
}

// ============================================================
// PROGRESSION ACTIONS
// ============================================================

export async function updateProgressionRow(
  id: string,
  data: {
    label?: string | null;
    classLabel?: string | null;
    features?: string | null;
    spells?: string | null;
    notes?: string | null;
    status?: "DONE" | "CURRENT" | "FUTURE";
  }
) {
  const row = await prisma.characterProgression.update({
    where: { id },
    data,
  });
  revalidatePath("/character");
  return row;
}

export async function addProgressionRow(
  profileId: string,
  rowType: ProgressionRowType,
  label: string
) {
  // Find max sortOrder to append at the end
  const lastRow = await prisma.characterProgression.findFirst({
    where: { characterProfileId: profileId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  const sortOrder = (lastRow?.sortOrder ?? 20) + 1;

  const row = await prisma.characterProgression.create({
    data: {
      characterProfileId: profileId,
      rowType,
      label,
      sortOrder,
    },
  });
  revalidatePath("/character");
  return row;
}

export async function deleteProgressionRow(id: string) {
  // Only allow deleting non-LEVEL rows
  const row = await prisma.characterProgression.findUnique({
    where: { id },
    select: { rowType: true },
  });
  if (!row || row.rowType === "LEVEL") {
    throw new Error("Cannot delete level rows");
  }

  await prisma.characterProgression.delete({ where: { id } });
  revalidatePath("/character");
}

export async function reorderProgressionRow(
  id: string,
  newSortOrder: number
) {
  await prisma.characterProgression.update({
    where: { id },
    data: { sortOrder: newSortOrder },
  });
  revalidatePath("/character");
}

// ============================================================
// BACKWARD COMPAT — keep existing actions used by dashboard
// ============================================================

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

export async function updateCharacterSection(
  id: string,
  content: JsonValue
) {
  const section = await prisma.characterSection.update({
    where: { id },
    data: { content: content ? JSON.parse(JSON.stringify(content)) : Prisma.DbNull },
  });
  revalidatePath("/character");
  return section;
}
