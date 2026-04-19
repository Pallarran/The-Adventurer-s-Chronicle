import { PageHeaderSetter } from "@/components/layout/page-header-setter";
import { SidebarModeForm } from "@/components/settings/sidebar-mode-form";
import { ThemeModeForm } from "@/components/settings/theme-mode-form";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeaderSetter title="Settings" description="App preferences" />

      <div className="rounded-lg border border-border bg-card p-6">
        <SidebarModeForm />
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <ThemeModeForm />
      </div>
    </div>
  );
}
