import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActiveCampaign } from "@/lib/campaign";

export const dynamic = "force-dynamic";

export type MentionResult = {
  id: string;
  name: string;
  type: "npc" | "location" | "organization" | "item";
};

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const campaign = await getActiveCampaign();
  if (!campaign) return NextResponse.json([]);

  const [npcs, locations, organizations, items] = await Promise.all([
    prisma.npc.findMany({
      where: {
        campaignId: campaign.id,
        deletedAt: null,
        ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
      },
      select: { id: true, name: true },
      take: 5,
      orderBy: { name: "asc" },
    }),
    prisma.location.findMany({
      where: {
        campaignId: campaign.id,
        deletedAt: null,
        ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
      },
      select: { id: true, name: true },
      take: 5,
      orderBy: { name: "asc" },
    }),
    prisma.organization.findMany({
      where: {
        campaignId: campaign.id,
        deletedAt: null,
        ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
      },
      select: { id: true, name: true },
      take: 5,
      orderBy: { name: "asc" },
    }),
    prisma.item.findMany({
      where: {
        campaignId: campaign.id,
        deletedAt: null,
        ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
      },
      select: { id: true, name: true },
      take: 5,
      orderBy: { name: "asc" },
    }),
  ]);

  const results: MentionResult[] = [
    ...npcs.map((n) => ({ id: n.id, name: n.name, type: "npc" as const })),
    ...locations.map((l) => ({ id: l.id, name: l.name, type: "location" as const })),
    ...organizations.map((o) => ({ id: o.id, name: o.name, type: "organization" as const })),
    ...items.map((i) => ({ id: i.id, name: i.name, type: "item" as const })),
  ];

  return NextResponse.json(results);
}
