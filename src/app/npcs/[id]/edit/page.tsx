import { notFound } from "next/navigation";
import { getNpc } from "@/lib/actions/npcs";
import { getActiveCampaign } from "@/lib/campaign";
import { getSessions } from "@/lib/actions/sessions";
import { getOrganizations } from "@/lib/actions/organizations";
import { getTags } from "@/lib/actions/tags";
import { PageHeaderSetter } from "@/components/layout/page-header-setter";
import { NpcForm, NpcFormActions } from "@/components/npcs/npc-form";

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
      <PageHeaderSetter title={`Edit ${npc.name}`} backHref={`/npcs/${id}`} backLabel="NPC detail" />

      <div className="flex items-center gap-2 pb-4">
        <NpcFormActions isEdit={true} />
      </div>
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
