import { Suspense } from "react";
import { getActiveCampaign } from "@/lib/campaign";
import { getQuickNote } from "@/lib/actions/quick-notes";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { CharacterHeroCard } from "@/components/dashboard/character-hero-card";
import { LastSessionRecap } from "@/components/dashboard/last-session-recap";
import { QuickNotesCard } from "@/components/dashboard/quick-notes-card";
import { PartyMembers } from "@/components/dashboard/party-members";
import { PinnedTools } from "@/components/dashboard/pinned-tools";
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
      <PageHeader
        title="Dashboard"
        description="Your campaign command center."
      />

      <div className="grid gap-6">
        {/* Top row: Character (2/3) + Last Session (1/3) */}
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <Suspense fallback={<CardSkeleton className="h-full" />}>
              <CharacterHeroCard campaignId={campaign.id} />
            </Suspense>
          </div>
          <div className="lg:col-span-2">
            <Suspense fallback={<CardSkeleton className="h-full" />}>
              <LastSessionRecap campaignId={campaign.id} />
            </Suspense>
          </div>
        </div>

        {/* Middle row: Quick Notes + Party Members */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
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
          </div>
          <div>
            <Suspense fallback={<CardSkeleton className="h-full" />}>
              <PartyMembers campaignId={campaign.id} />
            </Suspense>
          </div>
        </div>

        {/* Bottom row: Pinned Tools (full width) */}
        <div>
          <Suspense fallback={<CardSkeleton />}>
            <PinnedTools campaignId={campaign.id} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
