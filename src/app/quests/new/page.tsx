import { redirect } from "next/navigation";
import { getActiveCampaign } from "@/lib/campaign";
import { getSessions } from "@/lib/actions/sessions";
import { PageHeaderSetter } from "@/components/layout/page-header-setter";
import { QuestForm, QuestFormActions } from "@/components/quests/quest-form";

export const dynamic = "force-dynamic";

export default async function NewQuestPage() {
  const campaign = await getActiveCampaign();
  if (!campaign) redirect("/");
  const sessions = await getSessions(campaign.id);

  return (
    <div>
      <PageHeaderSetter title="New Quest" />

      <div className="flex items-center gap-2 pb-4">
        <QuestFormActions isEdit={false} />
      </div>
      <QuestForm
        campaignId={campaign.id}
        allSessions={sessions.map((s) => ({
          id: s.id,
          name: `#${s.sessionNumber}${s.title ? ` — ${s.title}` : ""}`,
        }))}
      />
    </div>
  );
}
