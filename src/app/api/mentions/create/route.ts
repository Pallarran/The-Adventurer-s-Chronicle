import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActiveCampaign } from "@/lib/campaign";

export const dynamic = "force-dynamic";

const VALID_TYPES = ["npc", "location", "organization", "item"] as const;
type EntityType = (typeof VALID_TYPES)[number];

export async function POST(request: NextRequest) {
  const campaign = await getActiveCampaign();
  if (!campaign) {
    return NextResponse.json({ error: "No active campaign" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.name !== "string" || !body.name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!VALID_TYPES.includes(body.type)) {
    return NextResponse.json({ error: "Invalid entity type" }, { status: 400 });
  }

  const name = body.name.trim();
  const type: EntityType = body.type;

  try {
    const createFns: Record<EntityType, () => Promise<{ id: string; name: string }>> = {
      npc: () =>
        prisma.npc.create({
          data: { campaignId: campaign.id, name },
          select: { id: true, name: true },
        }),
      location: () =>
        prisma.location.create({
          data: { campaignId: campaign.id, name },
          select: { id: true, name: true },
        }),
      organization: () =>
        prisma.organization.create({
          data: { campaignId: campaign.id, name },
          select: { id: true, name: true },
        }),
      item: () =>
        prisma.item.create({
          data: { campaignId: campaign.id, name },
          select: { id: true, name: true },
        }),
    };

    const entity = await createFns[type]();
    return NextResponse.json({ id: entity.id, name: entity.name, type });
  } catch (err) {
    console.error("Failed to create entity from mention:", err);
    return NextResponse.json({ error: "Failed to create entity" }, { status: 500 });
  }
}
