import { getActiveCampaign } from "@/lib/campaign";
import { getTags } from "@/lib/actions/tags";
import { PageHeaderSetter } from "@/components/layout/page-header-setter";
import { ItemForm, ItemFormActions } from "@/components/items/item-form";

export const dynamic = "force-dynamic";

export default async function NewItemPage() {
  const campaign = await getActiveCampaign();
  const tags = await getTags(campaign.id);

  return (
    <div>
      <PageHeaderSetter title="New Item" />

      <div className="flex items-center gap-2 pb-4">
        <ItemFormActions isEdit={false} />
      </div>
      <ItemForm
        campaignId={campaign.id}
        allTags={tags.map((t) => ({ id: t.id, name: t.name }))}
      />
    </div>
  );
}
