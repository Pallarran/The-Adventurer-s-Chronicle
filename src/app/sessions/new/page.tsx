import { redirect } from "next/navigation";
import { getActiveCampaign } from "@/lib/campaign";
import { getNpcs } from "@/lib/actions/npcs";
import { getLocations } from "@/lib/actions/locations";
import { getOrganizations } from "@/lib/actions/organizations";
import { getNextSessionNumber } from "@/lib/actions/sessions";
import { getOpenQuests, getResolvedQuests } from "@/lib/actions/quests";
import { PageHeaderSetter } from "@/components/layout/page-header-setter";
import { SessionForm, SessionFormActions } from "@/components/sessions/session-form";

export const dynamic = "force-dynamic";

export default async function NewSessionPage() {
  const campaign = await getActiveCampaign();
  if (!campaign) redirect("/");
  const [npcs, locations, organizations, openQuests, resolvedQuests, nextSessionNumber] = await Promise.all([
    getNpcs(campaign.id),
    getLocations(campaign.id),
    getOrganizations(campaign.id),
    getOpenQuests(campaign.id),
    getResolvedQuests(campaign.id),
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
        openQuests={openQuests.map((q) => ({
          id: q.id,
          name: q.name,
          status: q.status,
          description: q.description,
          questGiverNpcId: q.questGiverNpcId,
        }))}
        resolvedQuests={resolvedQuests.map((q) => ({
          id: q.id,
          name: q.name,
          status: q.status,
          description: q.description,
          questGiverNpcId: q.questGiverNpcId,
        }))}
      />
    </div>
  );
}
