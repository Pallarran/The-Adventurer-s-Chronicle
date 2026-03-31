import { getLocations } from "@/lib/actions/locations";
import { getActiveCampaign } from "@/lib/campaign";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { MapPin, Plus } from "lucide-react";
import Link from "next/link";
import { LocationListClient } from "./location-list-client";

export const dynamic = "force-dynamic";

export default async function LocationsPage() {
  const campaign = await getActiveCampaign();
  const locations = await getLocations(campaign.id);

  return (
    <div>
      <PageHeader
        title="Locations"
        description="Places of importance in your campaign world."
      >
        <Link href="/locations/new" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            New Location
        </Link>
      </PageHeader>

      {locations.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No Locations Yet"
          description="Create your first location to start mapping your campaign world."
        >
          <Link href="/locations/new" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Create Location
          </Link>
        </EmptyState>
      ) : (
        <LocationListClient locations={locations} />
      )}
    </div>
  );
}
