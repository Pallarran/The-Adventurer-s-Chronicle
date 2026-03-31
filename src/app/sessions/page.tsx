import { getSessions } from "@/lib/actions/sessions";
import { getActiveCampaign } from "@/lib/campaign";
import { PageHeader } from "@/components/shared/page-header";
import { SessionCard } from "@/components/sessions/session-card";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScrollText, Plus } from "lucide-react";
import Link from "next/link";
import { SessionListClient } from "./session-list-client";

export const dynamic = "force-dynamic";

export default async function SessionsPage() {
  const campaign = await getActiveCampaign();
  const sessions = await getSessions(campaign.id);

  return (
    <div>
      <PageHeader title="Sessions" description="Your campaign session log.">
        <Link href="/sessions/new" className={cn(buttonVariants())}>
            <Plus className="mr-2 h-4 w-4" />
            New Session
        </Link>
      </PageHeader>

      {sessions.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="No Sessions Yet"
          description="Create your first session to start logging your adventure."
        >
          <Link href="/sessions/new" className={cn(buttonVariants())}>
              <Plus className="mr-2 h-4 w-4" />
              Create Session
          </Link>
        </EmptyState>
      ) : (
        <SessionListClient sessions={sessions} />
      )}
    </div>
  );
}
