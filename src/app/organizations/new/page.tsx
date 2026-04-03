import { redirect } from "next/navigation";
import { getActiveCampaign } from "@/lib/campaign";
import { getNpcs } from "@/lib/actions/npcs";
import { getLocations } from "@/lib/actions/locations";
import { getSessions } from "@/lib/actions/sessions";
import { getTags } from "@/lib/actions/tags";
import { PageHeaderSetter } from "@/components/layout/page-header-setter";
import { OrganizationForm, OrganizationFormActions } from "@/components/organizations/organization-form";

export const dynamic = "force-dynamic";

export default async function NewOrganizationPage() {
  const campaign = await getActiveCampaign();
  if (!campaign) redirect("/");
  const [npcs, locations, sessions, tags] = await Promise.all([
    getNpcs(campaign.id),
    getLocations(campaign.id),
    getSessions(campaign.id),
    getTags(campaign.id),
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
        allSessions={sessions.map((s) => ({
          id: s.id,
          name: `#${s.sessionNumber}${s.title ? ` — ${s.title}` : ""}`,
        }))}
        allNpcs={npcs.map((n) => ({ id: n.id, name: n.name }))}
        allTags={tags.map((t) => ({ id: t.id, name: t.name }))}
      />
    </div>
  );
}
