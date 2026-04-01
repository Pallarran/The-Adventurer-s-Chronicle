import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getLocation } from "@/lib/actions/locations";
import { PageHeaderSetter } from "@/components/layout/page-header-setter";
import { RichTextDisplay } from "@/components/shared/rich-text-display";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button-variants";
import { Pencil, MapPin, Shield, ScrollText, CalendarDays, Building, Tag } from "lucide-react";
import { LocationDeleteButton } from "./delete-button";
import { ImageLightbox } from "@/components/shared/image-lightbox";
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
      <PageHeaderSetter title={location.name} backHref="/locations" backLabel="Locations" />

      <div className="flex items-center gap-2 pb-4">
        <Link href={`/locations/${location.id}/edit`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </Link>
        <LocationDeleteButton id={location.id} />
      </div>

      {/* Image */}
      {location.mainImage ? (
        <ImageLightbox src={`/api/upload/${location.mainImage}`} alt={location.name}>
          <div className="relative mb-6 aspect-video w-full max-w-2xl overflow-hidden rounded-lg border border-border bg-muted">
            <Image
              src={`/api/upload/${location.mainImage}`}
              alt={location.name}
              fill
              className="object-contain"
            />
          </div>
        </ImageLightbox>
      ) : (
        <div className="relative mb-6 aspect-video w-full max-w-2xl overflow-hidden rounded-lg border border-border bg-muted">
          <div className="flex h-full w-full items-center justify-center">
            <MapPin className="h-12 w-12 text-muted-foreground/30" />
          </div>
        </div>
      )}

      {/* Metadata — compact inline (matches form identity fields: Name + Type) */}
      <div className="mb-6 flex items-center gap-4 text-sm text-muted-foreground">
        {location.type && (
          <Badge variant="outline">{location.type}</Badge>
        )}
      </div>

      {/* Relations + Tags — bordered cards (matches form card order) */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-lg border border-border p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <MapPin className="h-4 w-4" /> Parent Location
          </div>
          {location.parentLocation ? (
            <div className="flex flex-wrap gap-1.5">
              <Link href={`/locations/${location.parentLocation.id}`} className={cn(badgeVariants({variant: "secondary"}))}>
                {location.parentLocation.name}
              </Link>
            </div>
          ) : (
            <p className="text-sm italic text-muted-foreground/60">None</p>
          )}
        </div>
        <div className="rounded-lg border border-border p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <CalendarDays className="h-4 w-4" /> First Appearance
          </div>
          {location.firstAppearanceSession ? (
            <div className="flex flex-wrap gap-1.5">
              <Link href={`/sessions/${location.firstAppearanceSession.id}`} className={cn(badgeVariants({variant: "secondary"}))}>
                #{location.firstAppearanceSession.sessionNumber}
                {location.firstAppearanceSession.title
                  ? ` — ${location.firstAppearanceSession.title}`
                  : ""}
              </Link>
            </div>
          ) : (
            <p className="text-sm italic text-muted-foreground/60">None</p>
          )}
        </div>
        <div className="rounded-lg border border-border p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <CalendarDays className="h-4 w-4" /> Last Appearance
          </div>
          {location.lastAppearanceSession ? (
            <div className="flex flex-wrap gap-1.5">
              <Link href={`/sessions/${location.lastAppearanceSession.id}`} className={cn(badgeVariants({variant: "secondary"}))}>
                #{location.lastAppearanceSession.sessionNumber}
                {location.lastAppearanceSession.title
                  ? ` — ${location.lastAppearanceSession.title}`
                  : ""}
              </Link>
            </div>
          ) : (
            <p className="text-sm italic text-muted-foreground/60">None</p>
          )}
        </div>
        <div className="rounded-lg border border-border p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <Shield className="h-4 w-4" /> Organizations
          </div>
          {location.organizations.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {location.organizations.map((o) => (
                <Link key={o.organization.id} href={`/organizations/${o.organization.id}`} className={cn(badgeVariants({variant: "secondary"}))}>
                    {o.organization.name}
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm italic text-muted-foreground/60">None</p>
          )}
        </div>
        <div className="rounded-lg border border-border p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <Tag className="h-4 w-4" /> Tags
          </div>
          {location.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {location.tags.map((t) => (
                <Badge key={t.tag.id} variant="outline">
                  {t.tag.name}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm italic text-muted-foreground/60">None</p>
          )}
        </div>
      </div>

      {/* Read-only relations (not editable in form) */}
      {(location.childLocations.length > 0 || location.basedOrganizations.length > 0 || location.sessions.length > 0) && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {location.childLocations.length > 0 && (
            <div className="rounded-lg border border-border p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <MapPin className="h-4 w-4" /> Child Locations
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
          {location.basedOrganizations.length > 0 && (
            <div className="rounded-lg border border-border p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Building className="h-4 w-4" /> Based Here
              </div>
              <div className="flex flex-wrap gap-1.5">
                {location.basedOrganizations.map((org) => (
                  <Link key={org.id} href={`/organizations/${org.id}`} className={cn(badgeVariants({variant: "secondary"}))}>{org.name}</Link>
                ))}
              </div>
            </div>
          )}
          {location.sessions.length > 0 && (
            <div className="rounded-lg border border-border p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <ScrollText className="h-4 w-4" /> Featured Sessions
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
        </div>
      )}

      {/* Notes */}
      <div className="mb-6">
        <h2 className="mb-3 text-lg font-semibold">Notes</h2>
        <div className="rounded-lg border border-border bg-card p-4">
          {location.notesBody ? (
            <RichTextDisplay content={location.notesBody as JSONContent} />
          ) : (
            <p className="text-sm italic text-muted-foreground/60">No notes yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
