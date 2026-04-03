import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/actions/sessions";
import { getActiveCampaign } from "@/lib/campaign";
import { getNpcs } from "@/lib/actions/npcs";
import { getLocations } from "@/lib/actions/locations";
import { getOrganizations } from "@/lib/actions/organizations";
import { getTags } from "@/lib/actions/tags";
import { PageHeaderSetter } from "@/components/layout/page-header-setter";
import { SessionForm, SessionFormActions } from "@/components/sessions/session-form";

export const dynamic = "force-dynamic";

export default async function EditSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [session, campaign] = await Promise.all([
    getSession(id),
    getActiveCampaign(),
  ]);
  if (!campaign) redirect("/");
  if (!session) notFound();

  const [npcs, locations, organizations, tags] = await Promise.all([
    getNpcs(campaign.id),
    getLocations(campaign.id),
    getOrganizations(campaign.id),
    getTags(campaign.id),
  ]);

  return (
    <div>
      <PageHeaderSetter title={`Edit Session #${session.sessionNumber}`} backHref={`/sessions/${id}`} backLabel="Session detail" />

      <div className="flex items-center gap-2 pb-4">
        <SessionFormActions isEdit={true} />
      </div>
      <SessionForm
        campaignId={campaign.id}
        session={session}
        allNpcs={npcs.map((n) => ({ id: n.id, name: n.name }))}
        allLocations={locations.map((l) => ({ id: l.id, name: l.name }))}
        allOrganizations={organizations.map((o) => ({ id: o.id, name: o.name }))}
        allTags={tags.map((t) => ({ id: t.id, name: t.name }))}
      />
    </div>
  );
}
