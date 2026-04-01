import { getActiveCampaign } from "@/lib/campaign";
import { getNpcs } from "@/lib/actions/npcs";
import { getLocations } from "@/lib/actions/locations";
import { getOrganizations } from "@/lib/actions/organizations";
import { getTags } from "@/lib/actions/tags";
import { getNextSessionNumber } from "@/lib/actions/sessions";
import { PageHeaderSetter } from "@/components/layout/page-header-setter";
import { SessionForm, SessionFormActions } from "@/components/sessions/session-form";

export const dynamic = "force-dynamic";

export default async function NewSessionPage() {
  const campaign = await getActiveCampaign();
  const [npcs, locations, organizations, tags, nextSessionNumber] = await Promise.all([
    getNpcs(campaign.id),
    getLocations(campaign.id),
    getOrganizations(campaign.id),
    getTags(campaign.id),
    getNextSessionNumber(campaign.id),
  ]);

  return (
    <div>
      <PageHeaderSetter title="New Session" />

      <div className="flex items-center gap-2 pb-4">
        <SessionFormActions isEdit={false} />
      </div>
      <SessionForm
        campaignId={campaign.id}
        defaultSessionNumber={nextSessionNumber}
        allNpcs={npcs.map((n) => ({ id: n.id, name: n.name }))}
        allLocations={locations.map((l) => ({ id: l.id, name: l.name }))}
        allOrganizations={organizations.map((o) => ({ id: o.id, name: o.name }))}
        allTags={tags.map((t) => ({ id: t.id, name: t.name }))}
      />
    </div>
  );
}
