import { redirect } from "next/navigation";
import { getQuests } from "@/lib/actions/quests";
import { getActiveCampaign } from "@/lib/campaign";
import { EmptyState } from "@/components/shared/empty-state";
import { Compass, Plus } from "lucide-react";
import Link from "next/link";
import { QuestListClient } from "./quest-list-client";

import { PageHeaderSetter } from "@/components/layout/page-header-setter";

export const dynamic = "force-dynamic";

export default async function QuestsPage() {
  const campaign = await getActiveCampaign();
  if (!campaign) redirect("/");
  const quests = await getQuests(campaign.id);

  return (
    <div>
      <PageHeaderSetter title="Quests & Goals" description="Track quest leads, active pursuits, and completed objectives." />

      {quests.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="No Quests & Goals Yet"
          description="Create your first quest to start tracking campaign threads and objectives."
        >
          <Link href="/quests/new" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Create Quest
          </Link>
        </EmptyState>
      ) : (
        <QuestListClient quests={quests} />
      )}
    </div>
  );
}
