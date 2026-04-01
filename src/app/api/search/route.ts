import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActiveCampaign } from "@/lib/campaign";

export const dynamic = "force-dynamic";

export type SearchResult = {
  type: "session" | "npc" | "location" | "organization";
  id: string;
  name: string;
  subtitle?: string;
};

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  const campaign = await getActiveCampaign();

  const [sessions, npcs, locations, organizations] = await Promise.all([
    prisma.session.findMany({
      where: {
        campaignId: campaign.id,
        deletedAt: null,
        OR: [
          { title: { contains: q, mode: "insensitive" as const } },
          { sessionNumber: isNaN(Number(q)) ? undefined : Number(q) },
        ].filter(Boolean),
      },
      select: { id: true, title: true, sessionNumber: true },
      take: 5,
    }),
    prisma.npc.findMany({
      where: {
        campaignId: campaign.id,
        deletedAt: null,
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { aliasTitle: { contains: q, mode: "insensitive" as const } },
        ],
      },
      select: { id: true, name: true, race: true, classRole: true },
      take: 5,
    }),
    prisma.location.findMany({
      where: {
        campaignId: campaign.id,
        deletedAt: null,
        name: { contains: q, mode: "insensitive" as const },
      },
      select: { id: true, name: true, type: true },
      take: 5,
    }),
    prisma.organization.findMany({
      where: {
        campaignId: campaign.id,
        deletedAt: null,
        name: { contains: q, mode: "insensitive" as const },
      },
      select: { id: true, name: true, type: true },
      take: 5,
    }),
  ]);

  const results: SearchResult[] = [
    ...sessions.map((s) => ({
      type: "session" as const,
      id: s.id,
      name: s.title || `Session ${s.sessionNumber}`,
      subtitle: `Session ${s.sessionNumber}`,
    })),
    ...npcs.map((n) => ({
      type: "npc" as const,
      id: n.id,
      name: n.name,
      subtitle: [n.race, n.classRole].filter(Boolean).join(" ") || undefined,
    })),
    ...locations.map((l) => ({
      type: "location" as const,
      id: l.id,
      name: l.name,
      subtitle: l.type ?? undefined,
    })),
    ...organizations.map((o) => ({
      type: "organization" as const,
      id: o.id,
      name: o.name,
      subtitle: o.type ?? undefined,
    })),
  ];

  return NextResponse.json(results);
}
