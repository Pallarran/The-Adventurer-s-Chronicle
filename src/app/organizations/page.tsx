import { getOrganizations } from "@/lib/actions/organizations";
import { getActiveCampaign } from "@/lib/campaign";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Shield, Plus } from "lucide-react";
import Link from "next/link";
import { OrgListClient } from "./org-list-client";

export const dynamic = "force-dynamic";

export default async function OrganizationsPage() {
  const campaign = await getActiveCampaign();
  const organizations = await getOrganizations(campaign.id);

  return (
    <div>
      <PageHeader
        title="Organizations"
        description="Factions, guilds, and groups shaping the campaign."
      >
        <Link href="/organizations/new" className={cn(buttonVariants())}>
            <Plus className="mr-2 h-4 w-4" />
            New Organization
        </Link>
      </PageHeader>

      {organizations.length === 0 ? (
        <EmptyState
          icon={Shield}
          title="No Organizations Yet"
          description="Create your first organization to start tracking the factions at play."
        >
          <Link href="/organizations/new" className={cn(buttonVariants())}>
              <Plus className="mr-2 h-4 w-4" />
              Create Organization
          </Link>
        </EmptyState>
      ) : (
        <OrgListClient organizations={organizations} />
      )}
    </div>
  );
}
