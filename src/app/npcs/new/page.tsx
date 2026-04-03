import { redirect } from "next/navigation";
import { getActiveCampaign } from "@/lib/campaign";
import { getSessions } from "@/lib/actions/sessions";
import { getOrganizations } from "@/lib/actions/organizations";
import { getTags } from "@/lib/actions/tags";
import { PageHeaderSetter } from "@/components/layout/page-header-setter";
import { NpcForm, NpcFormActions } from "@/components/npcs/npc-form";

export const dynamic = "force-dynamic";

export default async function NewNpcPage() {
  const campaign = await getActiveCampaign();
  if (!campaign) redirect("/");
  const [sessions, organizations, tags] = await Promise.all([
    getSessions(campaign.id),
    getOrganizations(campaign.id),
    getTags(campaign.id),
  ]);

  return (
    <div>
      <PageHeaderSetter title="New NPC" />

      <div className="flex items-center gap-2 pb-4">
        <NpcFormActions isEdit={false} />
      </div>
      <NpcForm
        campaignId={campaign.id}
        allOrganizations={organizations.map((o) => ({ id: o.id, name: o.name }))}
        allSessions={sessions.map((s) => ({
          id: s.id,
          name: `#${s.sessionNumber}${s.title ? ` — ${s.title}` : ""}`,
        }))}
        allTags={tags.map((t) => ({ id: t.id, name: t.name }))}
      />
    </div>
  );
}
