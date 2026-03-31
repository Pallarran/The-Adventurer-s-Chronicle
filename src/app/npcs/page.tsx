import { getNpcs } from "@/lib/actions/npcs";
import { getActiveCampaign } from "@/lib/campaign";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Users, Plus } from "lucide-react";
import Link from "next/link";
import { NpcListClient } from "./npc-list-client";

export const dynamic = "force-dynamic";

export default async function NpcsPage() {
  const campaign = await getActiveCampaign();
  const npcs = await getNpcs(campaign.id);

  return (
    <div>
      <PageHeader
        title="NPCs"
        description="Characters you've encountered in your campaign."
      >
        <Link href="/npcs/new" className={cn(buttonVariants())}>
            <Plus className="mr-2 h-4 w-4" />
            New NPC
        </Link>
      </PageHeader>

      {npcs.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No NPCs Yet"
          description="Create your first NPC to start tracking the characters in your campaign."
        >
          <Link href="/npcs/new" className={cn(buttonVariants())}>
              <Plus className="mr-2 h-4 w-4" />
              Create NPC
          </Link>
        </EmptyState>
      ) : (
        <NpcListClient npcs={npcs} />
      )}
    </div>
  );
}
