import { Sidebar } from "./sidebar";
import { AppShellClient } from "./app-shell-client";
import { PageHeaderProvider } from "./page-header-context";
import { FormGuardProvider } from "./form-guard-provider";
import { SidebarModeProvider } from "./sidebar-mode-context";
import { getActiveCampaign } from "@/lib/campaign";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const campaign = await getActiveCampaign();
  const campaignId = campaign?.id ?? null;

  return (
    <FormGuardProvider>
      <PageHeaderProvider>
        <SidebarModeProvider>
          <div className="min-h-screen">
            <Sidebar activeCampaignId={campaignId} />
            <AppShellClient campaignId={campaignId}>{children}</AppShellClient>
          </div>
        </SidebarModeProvider>
      </PageHeaderProvider>
    </FormGuardProvider>
  );
}
