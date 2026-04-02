import { Suspense } from "react";
import { getActiveCampaign } from "@/lib/campaign";
import { getQuickNote } from "@/lib/actions/quick-notes";
import { Skeleton } from "@/components/ui/skeleton";
import { CharacterHeroCard } from "@/components/dashboard/character-hero-card";
import { RecentSessions } from "@/components/dashboard/recent-sessions";
import { QuickNotesCard } from "@/components/dashboard/quick-notes-card";
import { PartyMembers } from "@/components/dashboard/party-members";
import { PinnedTools } from "@/components/dashboard/pinned-tools";
import { PageHeaderSetter } from "@/components/layout/page-header-setter";
import type { JSONContent } from "@tiptap/react";

export const dynamic = "force-dynamic";

function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Skeleton className="h-full min-h-[200px] w-full rounded-xl" />
    </div>
  );
}


export default async function DashboardPage() {
  const campaign = await getActiveCampaign();
  const quickNote = await getQuickNote(campaign.id);

  return (
    <div>
      <PageHeaderSetter title="Dashboard" description="Your campaign command center" />

      <div className="grid gap-6">
        {/* Top row: Character (3/5) + Recent Sessions (2/5) */}
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <Suspense fallback={<CardSkeleton className="h-full" />}>
              <CharacterHeroCard campaignId={campaign.id} />
            </Suspense>
          </div>
          <div className="lg:col-span-2">
            <Suspense fallback={<CardSkeleton className="h-full" />}>
              <RecentSessions campaignId={campaign.id} />
            </Suspense>
          </div>
        </div>

        {/* Middle row: Party Members (3/5) + Quick Notes & Pinned Tools (2/5) */}
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <Suspense fallback={<CardSkeleton className="h-full" />}>
              <PartyMembers campaignId={campaign.id} />
            </Suspense>
          </div>
          <div className="grid gap-6 xl:grid-cols-2 lg:col-span-2">
            {quickNote ? (
              <QuickNotesCard
                quickNote={{
                  id: quickNote.id,
                  content: quickNote.content as JSONContent | null,
                }}
              />
            ) : (
              <QuickNotesCard
                quickNote={{
                  id: "",
                  content: null,
                }}
              />
            )}
            <Suspense fallback={<CardSkeleton className="h-full" />}>
              <PinnedTools campaignId={campaign.id} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
