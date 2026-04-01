import { getOrganizations } from "@/lib/actions/organizations";
import { getActiveCampaign } from "@/lib/campaign";
import { EmptyState } from "@/components/shared/empty-state";
import { Shield, Plus } from "lucide-react";
import Link from "next/link";
import { OrgListClient } from "./org-list-client";
import { PageHeaderSetter } from "@/components/layout/page-header-setter";

export const dynamic = "force-dynamic";

export default async function OrganizationsPage() {
  const campaign = await getActiveCampaign();
  const organizations = await getOrganizations(campaign.id);

  return (
    <div>
      <PageHeaderSetter title="Organizations" description="Factions, guilds, and groups shaping the campaign." />

      {organizations.length === 0 ? (
        <EmptyState
          icon={Shield}
          title="No Organizations Yet"
          description="Create your first organization to start tracking the factions at play."
        >
          <Link href="/organizations/new" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Create Organization
          </Link>
        </EmptyState>
      ) : (
        <OrgListClient
          organizations={organizations}
          headerActions={
            <Link href="/organizations/new" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              New Organization
            </Link>
          }
        />
      )}
    </div>
  );
}
