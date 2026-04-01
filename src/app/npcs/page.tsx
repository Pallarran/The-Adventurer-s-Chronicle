import { getNpcs } from "@/lib/actions/npcs";
import { getActiveCampaign } from "@/lib/campaign";
import { EmptyState } from "@/components/shared/empty-state";
import { Users, Plus } from "lucide-react";
import Link from "next/link";
import { NpcListClient } from "./npc-list-client";
import { PageHeaderSetter } from "@/components/layout/page-header-setter";

export const dynamic = "force-dynamic";

export default async function NpcsPage() {
  const campaign = await getActiveCampaign();
  const npcs = await getNpcs(campaign.id);

  return (
    <div>
      <PageHeaderSetter title="NPCs" description="Characters you've encountered in your campaign." />

      {npcs.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No NPCs Yet"
          description="Create your first NPC to start tracking the characters in your campaign."
        >
          <Link href="/npcs/new" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Create NPC
          </Link>
        </EmptyState>
      ) : (
        <NpcListClient
          npcs={npcs}
          headerActions={
            <Link href="/npcs/new" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              New NPC
            </Link>
          }
        />
      )}
    </div>
  );
}
