import { redirect } from "next/navigation";
import { PageHeaderSetter } from "@/components/layout/page-header-setter";
import { ToolsManager } from "@/components/tools/tools-manager";
import { getActiveCampaign } from "@/lib/campaign";
import { getToolLinks } from "@/lib/actions/tools";

export const dynamic = "force-dynamic";

export default async function ToolsPage() {
  const campaign = await getActiveCampaign();
  if (!campaign) redirect("/");
  const tools = await getToolLinks(campaign.id);

  const initialTools = tools.map((tool) => ({
    id: tool.id,
    name: tool.name,
    url: tool.url,
    icon: tool.icon ?? null,
    category: tool.category ?? null,
    pinnedToDashboard: tool.pinnedToDashboard,
  }));

  return (
    <div>
      <PageHeaderSetter title="Links & Tools" description="External tools and campaign resources." />
      <ToolsManager campaignId={campaign.id} initialTools={initialTools} />
    </div>
  );
}
