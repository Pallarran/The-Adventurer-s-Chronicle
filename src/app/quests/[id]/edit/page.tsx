import { notFound } from "next/navigation";
import { getQuest } from "@/lib/actions/quests";
import { getActiveCampaign } from "@/lib/campaign";
import { getSessions } from "@/lib/actions/sessions";
import { PageHeaderSetter } from "@/components/layout/page-header-setter";
import { QuestForm, QuestFormActions } from "@/components/quests/quest-form";

export const dynamic = "force-dynamic";

export default async function EditQuestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [quest, campaign] = await Promise.all([
    getQuest(id),
    getActiveCampaign(),
  ]);
  if (!quest) notFound();

  const sessions = await getSessions(campaign.id);

  return (
    <div>
      <PageHeaderSetter title={`Edit ${quest.name}`} backHref={`/quests/${id}`} backLabel="Quests & Goals" />

      <div className="flex items-center gap-2 pb-4">
        <QuestFormActions isEdit={true} />
      </div>
      <QuestForm
        campaignId={campaign.id}
        quest={quest}
        allSessions={sessions.map((s) => ({
          id: s.id,
          name: `#${s.sessionNumber}${s.title ? ` — ${s.title}` : ""}`,
        }))}
      />
    </div>
  );
}
