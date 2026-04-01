import { notFound } from "next/navigation";
import { getOrganization } from "@/lib/actions/organizations";
import { getActiveCampaign } from "@/lib/campaign";
import { getNpcs } from "@/lib/actions/npcs";
import { getLocations } from "@/lib/actions/locations";
import { getSessions } from "@/lib/actions/sessions";
import { getTags } from "@/lib/actions/tags";
import { PageHeaderSetter } from "@/components/layout/page-header-setter";
import { OrganizationForm, OrganizationFormActions } from "@/components/organizations/organization-form";

export const dynamic = "force-dynamic";

export default async function EditOrganizationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [organization, campaign] = await Promise.all([
    getOrganization(id),
    getActiveCampaign(),
  ]);
  if (!organization) notFound();

  const [npcs, locations, sessions, tags] = await Promise.all([
    getNpcs(campaign.id),
    getLocations(campaign.id),
    getSessions(campaign.id),
    getTags(campaign.id),
  ]);

  return (
    <div>
      <PageHeaderSetter title={`Edit ${organization.name}`} backHref={`/organizations/${id}`} backLabel="Organization detail" />

      <div className="flex items-center gap-2 pb-4">
        <OrganizationFormActions isEdit={true} />
      </div>
      <OrganizationForm
        campaignId={campaign.id}
        organization={organization}
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
