import { getActiveCampaign } from "@/lib/campaign";
import { getLocations } from "@/lib/actions/locations";
import { getSessions } from "@/lib/actions/sessions";
import { getOrganizations } from "@/lib/actions/organizations";
import { getTags } from "@/lib/actions/tags";
import { PageHeader } from "@/components/shared/page-header";
import { LocationForm } from "@/components/locations/location-form";

export const dynamic = "force-dynamic";

export default async function NewLocationPage() {
  const campaign = await getActiveCampaign();
  const [locations, sessions, organizations, tags] = await Promise.all([
    getLocations(campaign.id),
    getSessions(campaign.id),
    getOrganizations(campaign.id),
    getTags(campaign.id),
  ]);

  return (
    <div>
      <PageHeader title="New Location" description="Add a new location to your campaign." />
      <LocationForm
        campaignId={campaign.id}
        allLocations={locations.map((l) => ({ id: l.id, name: l.name }))}
        allSessions={sessions.map((s) => ({
          id: s.id,
          name: `#${s.sessionNumber}${s.title ? ` — ${s.title}` : ""}`,
        }))}
        allOrganizations={organizations.map((o) => ({ id: o.id, name: o.name }))}
        allTags={tags.map((t) => ({ id: t.id, name: t.name }))}
      />
    </div>
  );
}
