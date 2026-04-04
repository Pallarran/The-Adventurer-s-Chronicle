import { notFound, redirect } from "next/navigation";
import { getNpc } from "@/lib/actions/npcs";
import { getActiveCampaign } from "@/lib/campaign";
import { getOrganizations } from "@/lib/actions/organizations";
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
  if (!campaign) redirect("/");
  if (!npc) notFound();

  const organizations = await getOrganizations(campaign.id);

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
      />
    </div>
  );
}
