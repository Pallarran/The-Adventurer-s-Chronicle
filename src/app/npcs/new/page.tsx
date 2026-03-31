import { getActiveCampaign } from "@/lib/campaign";
import { getSessions } from "@/lib/actions/sessions";
import { getOrganizations } from "@/lib/actions/organizations";
import { getTags } from "@/lib/actions/tags";
import { PageHeader } from "@/components/shared/page-header";
import { NpcForm } from "@/components/npcs/npc-form";

export const dynamic = "force-dynamic";

export default async function NewNpcPage() {
  const campaign = await getActiveCampaign();
  const [sessions, organizations, tags] = await Promise.all([
    getSessions(campaign.id),
    getOrganizations(campaign.id),
    getTags(campaign.id),
  ]);

  return (
    <div>
      <PageHeader title="New NPC" description="Add a new character to your campaign." />
      <NpcForm
        campaignId={campaign.id}
        allOrganizations={organizations.map((o) => ({ id: o.id, name: o.name }))}
        allSessions={sessions.map((s) => ({
          id: s.id,
          name: `Session #${s.sessionNumber}`,
        }))}
        allTags={tags.map((t) => ({ id: t.id, name: t.name }))}
      />
    </div>
  );
}
