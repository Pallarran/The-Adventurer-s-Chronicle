import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getOrganization } from "@/lib/actions/organizations";
import { PageHeaderSetter } from "@/components/layout/page-header-setter";
import { RichTextDisplay } from "@/components/shared/rich-text-display";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button-variants";
import { Pencil, Users, MapPin, CalendarDays, ScrollText, Shield, Tag } from "lucide-react";
import { OrganizationDeleteButton } from "./delete-button";
import { ImageLightbox } from "@/components/shared/image-lightbox";
import { STANCE_COLORS, STANCE_LABELS } from "@/lib/colors";
import type { JSONContent } from "@tiptap/react";
import type { AlignmentStance } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

export default async function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const organization = await getOrganization(id);
  if (!organization) notFound();

  const stanceColor = STANCE_COLORS[organization.alignmentStance];

  return (
    <div>
      <PageHeaderSetter title={organization.name} backHref="/organizations" backLabel="Organizations" />

      <div className="flex items-center gap-2 pb-4">
        <Link href={`/organizations/${organization.id}/edit`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </Link>
        <OrganizationDeleteButton id={organization.id} />
      </div>

      {/* Image */}
      {organization.mainImage ? (
        <ImageLightbox src={`/api/upload/${organization.mainImage}`} alt={organization.name}>
          <div className="relative mb-6 aspect-video w-full max-w-2xl overflow-hidden rounded-lg border border-border bg-muted">
            <Image
              src={`/api/upload/${organization.mainImage}`}
              alt={organization.name}
              fill
              className="object-contain"
            />
          </div>
        </ImageLightbox>
      ) : (
        <div className="relative mb-6 aspect-video w-full max-w-2xl overflow-hidden rounded-lg border border-border bg-muted">
          <div className="flex h-full w-full items-center justify-center">
            <Shield className="h-12 w-12 text-muted-foreground/30" />
          </div>
        </div>
      )}

      {/* Metadata — compact inline (matches form identity fields: Name + Type + Stance) */}
      <div className="mb-6 flex items-center gap-4 text-sm text-muted-foreground">
        {organization.type && (
          <span>{organization.type}</span>
        )}
        <Badge
          variant="outline"
          className="border-transparent"
          style={{
            backgroundColor: `${stanceColor}20`,
            color: stanceColor,
          }}
        >
          {STANCE_LABELS[organization.alignmentStance]}
        </Badge>
      </div>

      {/* Relations + Tags — bordered cards (matches form card order) */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-lg border border-border p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <MapPin className="h-4 w-4" /> Base Location
          </div>
          {organization.baseLocation ? (
            <div className="flex flex-wrap gap-1.5">
              <Link href={`/locations/${organization.baseLocation.id}`} className={cn(badgeVariants({variant: "secondary"}))}>
                {organization.baseLocation.name}
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
          {organization.firstAppearanceSession ? (
            <div className="flex flex-wrap gap-1.5">
              <Link href={`/sessions/${organization.firstAppearanceSession.id}`} className={cn(badgeVariants({variant: "secondary"}))}>
                #{organization.firstAppearanceSession.sessionNumber}
                {organization.firstAppearanceSession.title
                  ? ` — ${organization.firstAppearanceSession.title}`
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
          {organization.lastAppearanceSession ? (
            <div className="flex flex-wrap gap-1.5">
              <Link href={`/sessions/${organization.lastAppearanceSession.id}`} className={cn(badgeVariants({variant: "secondary"}))}>
                #{organization.lastAppearanceSession.sessionNumber}
                {organization.lastAppearanceSession.title
                  ? ` — ${organization.lastAppearanceSession.title}`
                  : ""}
              </Link>
            </div>
          ) : (
            <p className="text-sm italic text-muted-foreground/60">None</p>
          )}
        </div>
        <div className="rounded-lg border border-border p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <Users className="h-4 w-4" /> Known Members
          </div>
          {organization.npcs.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {organization.npcs.map((n) => (
                <Link key={n.npc.id} href={`/npcs/${n.npc.id}`} className={cn(badgeVariants({variant: "secondary"}))}>{n.npc.name}</Link>
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
          {organization.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {organization.tags.map((t) => (
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
      {((organization.locations && organization.locations.length > 0) || (organization.sessions && organization.sessions.length > 0)) && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {organization.locations && organization.locations.length > 0 && (
            <div className="rounded-lg border border-border p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <MapPin className="h-4 w-4" /> Locations
              </div>
              <div className="flex flex-wrap gap-1.5">
                {organization.locations.map((l) => (
                  <Link key={l.location.id} href={`/locations/${l.location.id}`} className={cn(badgeVariants({variant: "secondary"}))}>{l.location.name}</Link>
                ))}
              </div>
            </div>
          )}
          {organization.sessions && organization.sessions.length > 0 && (
            <div className="rounded-lg border border-border p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <ScrollText className="h-4 w-4" /> Featured Sessions
              </div>
              <div className="flex flex-wrap gap-1.5">
                {organization.sessions.map((s) => (
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
          {organization.notesBody ? (
            <RichTextDisplay content={organization.notesBody as JSONContent} />
          ) : (
            <p className="text-sm italic text-muted-foreground/60">No notes yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
