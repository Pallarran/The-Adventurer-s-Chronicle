import { getItems } from "@/lib/actions/items";
import { getActiveCampaign } from "@/lib/campaign";
import { EmptyState } from "@/components/shared/empty-state";
import { Package, Plus } from "lucide-react";
import Link from "next/link";
import { ItemListClient } from "./item-list-client";
import { PageHeaderSetter } from "@/components/layout/page-header-setter";

export const dynamic = "force-dynamic";

export default async function ItemsPage() {
  const campaign = await getActiveCampaign();
  const items = await getItems(campaign.id);

  return (
    <div>
      <PageHeaderSetter title="Items" description="Encyclopedia of items, equipment, and loot." />

      {items.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No Items Yet"
          description="Create your first item to start building your item encyclopedia."
        >
          <Link href="/items/new" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Create Item
          </Link>
        </EmptyState>
      ) : (
        <ItemListClient
          items={items}
          headerActions={
            <Link href="/items/new" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              New Item
            </Link>
          }
        />
      )}
    </div>
  );
}
