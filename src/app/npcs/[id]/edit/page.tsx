import { notFound } from "next/navigation";
import { getNpc } from "@/lib/actions/npcs";
import { getActiveCampaign } from "@/lib/campaign";
import { getSessions } from "@/lib/actions/sessions";
import { getOrganizations } from "@/lib/actions/organizations";
import { getTags } from "@/lib/actions/tags";
import { PageHeader } from "@/components/shared/page-header";
import { NpcForm } from "@/components/npcs/npc-form";

export const dynamic = "force-dynamic";

export default async function EditNpcPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [npc, campaign] = await Promise.all([
    getNpc(id),
    getActiveCampaign(),
  ]);
  if (!npc) notFound();

  const [sessions, organizations, tags] = await Promise.all([
    getSessions(campaign.id),
    getOrganizations(campaign.id),
    getTags(campaign.id),
  ]);

  return (
    <div>
      <PageHeader
        title={`Edit ${npc.name}`}
        description="Update NPC details."
      />
      <NpcForm
        campaignId={campaign.id}
        npc={npc}
        allOrganizations={organizations.map((o) => ({ id: o.id, name: o.name }))}
        allSessions={sessions.map((s) => ({
          id: s.id,
          name: `Session #${s.sessionNumber}`,
        }))}
        allTags={tags.map((t) => ({ id: t.id, name: t.name }))}
      />
    </div>
  );
}
