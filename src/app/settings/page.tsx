import { redirect } from "next/navigation";
import { getActiveCampaign } from "@/lib/campaign";
import { PageHeaderSetter } from "@/components/layout/page-header-setter";
import { SidebarModeForm } from "@/components/settings/sidebar-mode-form";
import { ThemeModeForm } from "@/components/settings/theme-mode-form";
import { CampaignExportButton } from "@/components/settings/campaign-export-button";
import { OllamaStatus } from "@/components/settings/ollama-status";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const campaign = await getActiveCampaign();
  if (!campaign) redirect("/");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeaderSetter title="Settings" description="App preferences" />

      <div className="rounded-lg border border-border bg-card p-6">
        <SidebarModeForm />
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <ThemeModeForm />
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">AI (Ollama)</h2>
            <p className="text-sm text-muted-foreground">
              Local AI for session summaries. Powered by Ollama — free, private, runs on your server.
            </p>
          </div>
          <OllamaStatus />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Campaign Export</h2>
            <p className="text-sm text-muted-foreground">
              Export your entire campaign as a single Markdown file — character, NPCs, locations, organizations, items, quests, and all session notes.
            </p>
          </div>
          <CampaignExportButton campaignId={campaign.id} campaignName={campaign.name} />
        </div>
      </div>
    </div>
  );
}
