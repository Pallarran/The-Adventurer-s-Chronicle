import { getActiveCampaign } from "@/lib/campaign";
import { getNpcs } from "@/lib/actions/npcs";
import { getLocations } from "@/lib/actions/locations";
import { getOrganizations } from "@/lib/actions/organizations";
import { getTags } from "@/lib/actions/tags";
import { PageHeader } from "@/components/shared/page-header";
import { SessionForm } from "@/components/sessions/session-form";

export const dynamic = "force-dynamic";

export default async function NewSessionPage() {
  const campaign = await getActiveCampaign();
  const [npcs, locations, organizations, tags] = await Promise.all([
    getNpcs(campaign.id),
    getLocations(campaign.id),
    getOrganizations(campaign.id),
    getTags(campaign.id),
  ]);

  return (
    <div>
      <PageHeader title="New Session" description="Log a new session." />
      <SessionForm
        campaignId={campaign.id}
        allNpcs={npcs.map((n) => ({ id: n.id, name: n.name }))}
        allLocations={locations.map((l) => ({ id: l.id, name: l.name }))}
        allOrganizations={organizations.map((o) => ({ id: o.id, name: o.name }))}
        allTags={tags.map((t) => ({ id: t.id, name: t.name }))}
      />
    </div>
  );
}
