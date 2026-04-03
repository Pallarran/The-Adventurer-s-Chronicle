"use server";

import { prisma } from "@/lib/prisma";

/**
 * Recompute firstAppearanceSessionId and lastAppearanceSessionId
 * for the given NPC IDs based on their SessionNpc junction records.
 */
export async function recomputeNpcAppearances(npcIds: string[]) {
  if (!npcIds.length) return;

  for (const npcId of npcIds) {
    const first = await prisma.sessionNpc.findFirst({
      where: { npcId, session: { deletedAt: null } },
      orderBy: { session: { sessionNumber: "asc" } },
      select: { sessionId: true },
    });
    const last = await prisma.sessionNpc.findFirst({
      where: { npcId, session: { deletedAt: null } },
      orderBy: { session: { sessionNumber: "desc" } },
      select: { sessionId: true },
    });

    await prisma.npc.update({
      where: { id: npcId },
      data: {
        firstAppearanceSessionId: first?.sessionId ?? null,
        lastAppearanceSessionId: last?.sessionId ?? null,
      },
    });
  }
}

/**
 * Recompute firstAppearanceSessionId and lastAppearanceSessionId
 * for the given Location IDs based on their SessionLocation junction records.
 */
export async function recomputeLocationAppearances(locationIds: string[]) {
  if (!locationIds.length) return;

  for (const locationId of locationIds) {
    const first = await prisma.sessionLocation.findFirst({
      where: { locationId, session: { deletedAt: null } },
      orderBy: { session: { sessionNumber: "asc" } },
      select: { sessionId: true },
    });
    const last = await prisma.sessionLocation.findFirst({
      where: { locationId, session: { deletedAt: null } },
      orderBy: { session: { sessionNumber: "desc" } },
      select: { sessionId: true },
    });

    await prisma.location.update({
      where: { id: locationId },
      data: {
        firstAppearanceSessionId: first?.sessionId ?? null,
        lastAppearanceSessionId: last?.sessionId ?? null,
      },
    });
  }
}

/**
 * Recompute firstAppearanceSessionId and lastAppearanceSessionId
 * for the given Organization IDs based on their SessionOrganization junction records.
 */
export async function recomputeOrgAppearances(orgIds: string[]) {
  if (!orgIds.length) return;

  for (const orgId of orgIds) {
    const first = await prisma.sessionOrganization.findFirst({
      where: { organizationId: orgId, session: { deletedAt: null } },
      orderBy: { session: { sessionNumber: "asc" } },
      select: { sessionId: true },
    });
    const last = await prisma.sessionOrganization.findFirst({
      where: { organizationId: orgId, session: { deletedAt: null } },
      orderBy: { session: { sessionNumber: "desc" } },
      select: { sessionId: true },
    });

    await prisma.organization.update({
      where: { id: orgId },
      data: {
        firstAppearanceSessionId: first?.sessionId ?? null,
        lastAppearanceSessionId: last?.sessionId ?? null,
      },
    });
  }
}
