import { notFound } from "next/navigation";
import { getItem } from "@/lib/actions/items";
import { getActiveCampaign } from "@/lib/campaign";
import { getTags } from "@/lib/actions/tags";
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
  if (!item) notFound();

  const tags = await getTags(campaign.id);

  return (
    <div>
      <PageHeaderSetter title={`Edit ${item.name}`} backHref={`/items/${id}`} backLabel="Item detail" />

      <div className="flex items-center gap-2 pb-4">
        <ItemFormActions isEdit={true} />
      </div>
      <ItemForm
        campaignId={campaign.id}
        item={item}
        allTags={tags.map((t) => ({ id: t.id, name: t.name }))}
      />
    </div>
  );
}
