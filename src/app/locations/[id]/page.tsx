import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getLocation } from "@/lib/actions/locations";
import { PageHeader } from "@/components/shared/page-header";
import { RichTextDisplay } from "@/components/shared/rich-text-display";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Pencil, MapPin, Shield, ScrollText, Building } from "lucide-react";
import { LocationDeleteButton } from "./delete-button";
import type { JSONContent } from "@tiptap/react";

export const dynamic = "force-dynamic";

export default async function LocationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const location = await getLocation(id);
  if (!location) notFound();

  return (
    <div>
      <PageHeader title={location.name}>
        <Link href={`/locations/${location.id}/edit`} className={cn(buttonVariants({variant: "outline", size: "sm"}))}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
        </Link>
        <LocationDeleteButton id={location.id} />
      </PageHeader>

      {/* Image */}
      {location.mainImage && (
        <div className="relative mb-6 aspect-video w-full max-w-2xl overflow-hidden rounded-lg border border-border">
          <Image
            src={`/api/upload/${location.mainImage}`}
            alt={location.name}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Metadata */}
      <div className="mb-6 grid grid-cols-1 gap-4 rounded-lg border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
        {location.type && (
          <div>
            <span className="text-xs font-medium text-muted-foreground">Type</span>
            <div className="mt-1">
              <Badge variant="outline">{location.type}</Badge>
            </div>
          </div>
        )}
        {location.parentLocation && (
          <div>
            <span className="text-xs font-medium text-muted-foreground">Parent Location</span>
            <div className="mt-1 flex items-center gap-1.5 text-sm">
              <MapPin className="h-3.5 w-3.5 text-gold" />
              <Link
                href={`/locations/${location.parentLocation.id}`}
                className="text-gold hover:underline"
              >
                {location.parentLocation.name}
              </Link>
            </div>
          </div>
        )}
        {location.firstAppearanceSession && (
          <div>
            <span className="text-xs font-medium text-muted-foreground">First Appearance</span>
            <div className="mt-1 flex items-center gap-1.5 text-sm">
              <ScrollText className="h-3.5 w-3.5 text-gold" />
              <Link
                href={`/sessions/${location.firstAppearanceSession.id}`}
                className="text-gold hover:underline"
              >
                #{location.firstAppearanceSession.sessionNumber}
                {location.firstAppearanceSession.title
                  ? ` — ${location.firstAppearanceSession.title}`
                  : ""}
              </Link>
            </div>
          </div>
        )}
        {location.lastAppearanceSession && (
          <div>
            <span className="text-xs font-medium text-muted-foreground">Last Appearance</span>
            <div className="mt-1 flex items-center gap-1.5 text-sm">
              <ScrollText className="h-3.5 w-3.5 text-gold" />
              <Link
                href={`/sessions/${location.lastAppearanceSession.id}`}
                className="text-gold hover:underline"
              >
                #{location.lastAppearanceSession.sessionNumber}
                {location.lastAppearanceSession.title
                  ? ` — ${location.lastAppearanceSession.title}`
                  : ""}
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Child Locations */}
      {location.childLocations.length > 0 && (
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" /> Child Locations
          </div>
          <div className="flex flex-wrap gap-1.5">
            {location.childLocations.map((child) => (
              <Link key={child.id} href={`/locations/${child.id}`} className={cn(badgeVariants({variant: "secondary"}))}>
                  {child.name}
                  {child.type && (
                    <span className="ml-1 text-muted-foreground">({child.type})</span>
                  )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Relations */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {location.organizations.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Shield className="h-3.5 w-3.5" /> Associated Organizations
            </div>
            <div className="flex flex-wrap gap-1.5">
              {location.organizations.map((o) => (
                <Link key={o.organization.id} href={`/organizations/${o.organization.id}`} className={cn(badgeVariants({variant: "secondary"}))}>
                    {o.organization.name}
                </Link>
              ))}
            </div>
          </div>
        )}
        {location.basedOrganizations.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Building className="h-3.5 w-3.5" /> Organizations Based Here
            </div>
            <div className="flex flex-wrap gap-1.5">
              {location.basedOrganizations.map((org) => (
                <Link key={org.id} href={`/organizations/${org.id}`} className={cn(badgeVariants({variant: "secondary"}))}>{org.name}</Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sessions */}
      {location.sessions.length > 0 && (
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <ScrollText className="h-3.5 w-3.5" /> Featured In Sessions
          </div>
          <div className="flex flex-wrap gap-1.5">
            {location.sessions.map((s) => (
              <Link key={s.session.id} href={`/sessions/${s.session.id}`} className={cn(badgeVariants({variant: "secondary"}))}>
                  #{s.session.sessionNumber}
                  {s.session.title ? ` — ${s.session.title}` : ""}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {location.tags.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-1.5">
          {location.tags.map((t) => (
            <Badge key={t.tag.id} variant="outline">
              {t.tag.name}
            </Badge>
          ))}
        </div>
      )}

      {/* Notes */}
      {location.notesBody && (
        <div className="mb-6">
          <h2 className="mb-3 text-lg font-semibold">Notes</h2>
          <div className="rounded-lg border border-border bg-card p-4">
            <RichTextDisplay content={location.notesBody as JSONContent} />
          </div>
        </div>
      )}
    </div>
  );
}
