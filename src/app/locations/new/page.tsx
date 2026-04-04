import { redirect } from "next/navigation";
import { getActiveCampaign } from "@/lib/campaign";
import { getLocations } from "@/lib/actions/locations";
import { getOrganizations } from "@/lib/actions/organizations";
import { PageHeaderSetter } from "@/components/layout/page-header-setter";
import { LocationForm, LocationFormActions } from "@/components/locations/location-form";

export const dynamic = "force-dynamic";

export default async function NewLocationPage() {
  const campaign = await getActiveCampaign();
  if (!campaign) redirect("/");
  const [locations, organizations] = await Promise.all([
    getLocations(campaign.id),
    getOrganizations(campaign.id),
  ]);

  return (
    <div>
      <PageHeaderSetter title="New Location" />

      <div className="flex items-center gap-2 pb-4">
        <LocationFormActions isEdit={false} />
      </div>
      <LocationForm
        campaignId={campaign.id}
        allLocations={locations.map((l) => ({ id: l.id, name: l.name }))}
        allOrganizations={organizations.map((o) => ({ id: o.id, name: o.name }))}
      />
    </div>
  );
}
