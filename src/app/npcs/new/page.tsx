import { redirect } from "next/navigation";
import { getActiveCampaign } from "@/lib/campaign";
import { getOrganizations } from "@/lib/actions/organizations";
import { PageHeaderSetter } from "@/components/layout/page-header-setter";
import { NpcForm, NpcFormActions } from "@/components/npcs/npc-form";

export const dynamic = "force-dynamic";

export default async function NewNpcPage() {
  const campaign = await getActiveCampaign();
  if (!campaign) redirect("/");
  const organizations = await getOrganizations(campaign.id);

  return (
    <div>
      <PageHeaderSetter title="New NPC" />

      <div className="flex items-center gap-2 pb-4">
        <NpcFormActions isEdit={false} />
      </div>
      <NpcForm
        campaignId={campaign.id}
        allOrganizations={organizations.map((o) => ({ id: o.id, name: o.name }))}
      />
    </div>
  );
}
