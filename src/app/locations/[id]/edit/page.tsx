import { notFound, redirect } from "next/navigation";
import { getLocation, getLocations } from "@/lib/actions/locations";
import { getActiveCampaign } from "@/lib/campaign";
import { getOrganizations } from "@/lib/actions/organizations";
import { getTags } from "@/lib/actions/tags";
import { PageHeaderSetter } from "@/components/layout/page-header-setter";
import { LocationForm, LocationFormActions } from "@/components/locations/location-form";

export const dynamic = "force-dynamic";

export default async function EditLocationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [location, campaign] = await Promise.all([
    getLocation(id),
    getActiveCampaign(),
  ]);
  if (!campaign) redirect("/");
  if (!location) notFound();

  const [locations, organizations, tags] = await Promise.all([
    getLocations(campaign.id),
    getOrganizations(campaign.id),
    getTags(campaign.id),
  ]);

  return (
    <div>
      <PageHeaderSetter title={`Edit ${location.name}`} backHref={`/locations/${id}`} backLabel="Location detail" />

      <div className="flex items-center gap-2 pb-4">
        <LocationFormActions isEdit={true} />
      </div>
      <LocationForm
        campaignId={campaign.id}
        location={location}
        allLocations={locations.map((l) => ({ id: l.id, name: l.name }))}
        allOrganizations={organizations.map((o) => ({ id: o.id, name: o.name }))}
        allTags={tags.map((t) => ({ id: t.id, name: t.name }))}
      />
    </div>
  );
}
