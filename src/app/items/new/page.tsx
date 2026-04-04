import { redirect } from "next/navigation";
import { getActiveCampaign } from "@/lib/campaign";
import { getSessions } from "@/lib/actions/sessions";
import { PageHeaderSetter } from "@/components/layout/page-header-setter";
import { ItemForm, ItemFormActions } from "@/components/items/item-form";

export const dynamic = "force-dynamic";

export default async function NewItemPage() {
  const campaign = await getActiveCampaign();
  if (!campaign) redirect("/");
  const sessions = await getSessions(campaign.id, { sortBy: "sessionNumber", sortOrder: "asc" });

  return (
    <div>
      <PageHeaderSetter title="New Item" />

      <div className="flex items-center gap-2 pb-4">
        <ItemFormActions isEdit={false} />
      </div>
      <ItemForm
        campaignId={campaign.id}
        allSessions={sessions.map((s) => ({
          id: s.id,
          name: `#${s.sessionNumber}${s.title ? ` — ${s.title}` : ""}`,
        }))}
      />
    </div>
  );
}
