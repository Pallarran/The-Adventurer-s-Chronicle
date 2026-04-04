import { redirect } from "next/navigation";
import { getActiveCampaign } from "@/lib/campaign";
import { getNpcs } from "@/lib/actions/npcs";
import { getLocations } from "@/lib/actions/locations";
import { PageHeaderSetter } from "@/components/layout/page-header-setter";
import { OrganizationForm, OrganizationFormActions } from "@/components/organizations/organization-form";

export const dynamic = "force-dynamic";

export default async function NewOrganizationPage() {
  const campaign = await getActiveCampaign();
  if (!campaign) redirect("/");
  const [npcs, locations] = await Promise.all([
    getNpcs(campaign.id),
    getLocations(campaign.id),
  ]);

  return (
    <div>
      <PageHeaderSetter title="New Organization" />

      <div className="flex items-center gap-2 pb-4">
        <OrganizationFormActions isEdit={false} />
      </div>
      <OrganizationForm
        campaignId={campaign.id}
        allLocations={locations.map((l) => ({ id: l.id, name: l.name }))}
        allNpcs={npcs.map((n) => ({ id: n.id, name: n.name }))}
      />
    </div>
  );
}
