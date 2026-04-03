import { Sidebar } from "./sidebar";
import { MobileSidebar } from "./mobile-sidebar";
import { Topbar } from "./topbar";
import { PageHeaderProvider } from "./page-header-context";
import { FormGuardProvider } from "./form-guard-provider";
import { getActiveCampaign } from "@/lib/campaign";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const campaign = await getActiveCampaign();
  const campaignId = campaign?.id ?? null;

  return (
    <FormGuardProvider>
      <PageHeaderProvider>
        <div className="min-h-screen">
          <Sidebar activeCampaignId={campaignId} />
          <div className="md:pl-60">
            <Topbar activeCampaignId={campaignId} />
            <main className="animate-in fade-in-0 duration-200 p-4 sm:p-6">{children}</main>
          </div>
        </div>
      </PageHeaderProvider>
    </FormGuardProvider>
  );
}
