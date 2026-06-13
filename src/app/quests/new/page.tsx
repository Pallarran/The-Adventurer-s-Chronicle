import { redirect } from "next/navigation";
import { getActiveCampaign } from "@/lib/campaign";
import { getNpcs } from "@/lib/actions/npcs";
import { PageHeaderSetter } from "@/components/layout/page-header-setter";
import { QuestForm, QuestFormActions } from "@/components/quests/quest-form";

export const dynamic = "force-dynamic";

export default async function NewQuestPage() {
  const campaign = await getActiveCampaign();
  if (!campaign) redirect("/");
  const npcs = await getNpcs(campaign.id);

  return (
    <div>
      <PageHeaderSetter title="New Quest" />

      <div className="flex items-center gap-2 pb-4">
        <QuestFormActions isEdit={false} />
      </div>
      <QuestForm
        campaignId={campaign.id}
        allNpcs={npcs.map((n) => ({ id: n.id, name: n.name }))}
      />
    </div>
  );
}
