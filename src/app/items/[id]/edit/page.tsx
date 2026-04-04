import { notFound, redirect } from "next/navigation";
import { getItem } from "@/lib/actions/items";
import { getActiveCampaign } from "@/lib/campaign";
import { getSessions } from "@/lib/actions/sessions";
import { PageHeaderSetter } from "@/components/layout/page-header-setter";
import { ItemForm, ItemFormActions } from "@/components/items/item-form";

export const dynamic = "force-dynamic";

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [item, campaign] = await Promise.all([
    getItem(id),
    getActiveCampaign(),
  ]);
  if (!campaign) redirect("/");
  if (!item) notFound();

  const sessions = await getSessions(campaign.id, { sortBy: "sessionNumber", sortOrder: "asc" });

  return (
    <div>
      <PageHeaderSetter title={`Edit ${item.name}`} backHref={`/items/${id}`} backLabel="Item detail" />

      <div className="flex items-center gap-2 pb-4">
        <ItemFormActions isEdit={true} />
      </div>
      <ItemForm
        campaignId={campaign.id}
        item={item}
        allSessions={sessions.map((s) => ({
          id: s.id,
          name: `#${s.sessionNumber}${s.title ? ` — ${s.title}` : ""}`,
        }))}
      />
    </div>
  );
}
