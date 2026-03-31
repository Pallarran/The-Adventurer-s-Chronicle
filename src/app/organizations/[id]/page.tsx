import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getOrganization } from "@/lib/actions/organizations";
import { PageHeader } from "@/components/shared/page-header";
import { RichTextDisplay } from "@/components/shared/rich-text-display";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Pencil, Shield, Users, MapPin, ScrollText } from "lucide-react";
import { OrganizationDeleteButton } from "./delete-button";
import type { JSONContent } from "@tiptap/react";
import type { AlignmentStance } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

const STANCE_COLORS: Record<AlignmentStance, string> = {
  ALLIED: "#4a9a5a",
  FRIENDLY: "#5a9a8a",
  NEUTRAL: "#6a6a7a",
  SUSPICIOUS: "#9a8a4a",
  HOSTILE: "#9a4a4a",
  UNKNOWN: "#5a5a6a",
};

const STANCE_LABELS: Record<AlignmentStance, string> = {
  ALLIED: "Allied",
  FRIENDLY: "Friendly",
  NEUTRAL: "Neutral",
  SUSPICIOUS: "Suspicious",
  HOSTILE: "Hostile",
  UNKNOWN: "Unknown",
};

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
      <PageHeader title={organization.name}>
        <Link href={`/organizations/${organization.id}/edit`} className={cn(buttonVariants({variant: "outline", size: "sm"}))}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
        </Link>
        <OrganizationDeleteButton id={organization.id} />
      </PageHeader>

      {/* Image + Metadata */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Image */}
        <div className="lg:col-span-1">
          {organization.mainImage ? (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border">
              <Image
                src={`/api/upload/${organization.mainImage}`}
                alt={organization.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex aspect-video w-full items-center justify-center rounded-lg border border-dashed border-border bg-card/50">
              <Shield className="h-12 w-12 text-muted-foreground/40" />
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {organization.type && (
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Type</span>
                  <p className="mt-1 text-sm">{organization.type}</p>
                </div>
              )}
              <div>
                <span className="text-xs font-medium text-muted-foreground">Stance</span>
                <div className="mt-1">
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
              </div>
              {organization.baseLocation && (
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Base Location</span>
                  <div className="mt-1 flex items-center gap-1.5 text-sm">
                    <MapPin className="h-3.5 w-3.5 text-gold" />
                    <Link
                      href={`/locations/${organization.baseLocation.id}`}
                      className="text-arcane-teal hover:underline"
                    >
                      {organization.baseLocation.name}
                    </Link>
                  </div>
                </div>
              )}
              {organization.firstAppearanceSession && (
                <div>
                  <span className="text-xs font-medium text-muted-foreground">First Appearance</span>
                  <div className="mt-1 flex items-center gap-1.5 text-sm">
                    <ScrollText className="h-3.5 w-3.5 text-gold" />
                    <Link
                      href={`/sessions/${organization.firstAppearanceSession.id}`}
                      className="text-arcane-teal hover:underline"
                    >
                      #{organization.firstAppearanceSession.sessionNumber}
                      {organization.firstAppearanceSession.title
                        ? ` — ${organization.firstAppearanceSession.title}`
                        : ""}
                    </Link>
                  </div>
                </div>
              )}
              {organization.lastAppearanceSession && (
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Last Appearance</span>
                  <div className="mt-1 flex items-center gap-1.5 text-sm">
                    <ScrollText className="h-3.5 w-3.5 text-gold" />
                    <Link
                      href={`/sessions/${organization.lastAppearanceSession.id}`}
                      className="text-arcane-teal hover:underline"
                    >
                      #{organization.lastAppearanceSession.sessionNumber}
                      {organization.lastAppearanceSession.title
                        ? ` — ${organization.lastAppearanceSession.title}`
                        : ""}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Known Members */}
      {organization.npcs.length > 0 && (
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Users className="h-3.5 w-3.5" /> Known Members
          </div>
          <div className="flex flex-wrap gap-1.5">
            {organization.npcs.map((n) => (
              <Link key={n.npc.id} href={`/npcs/${n.npc.id}`} className={cn(badgeVariants({variant: "secondary"}))}>{n.npc.name}</Link>
            ))}
          </div>
        </div>
      )}

      {/* Featured Sessions */}
      {organization.sessions && organization.sessions.length > 0 && (
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <ScrollText className="h-3.5 w-3.5" /> Featured In Sessions
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

      {/* Tags */}
      {organization.tags.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-1.5">
          {organization.tags.map((t) => (
            <Badge key={t.tag.id} variant="outline">
              {t.tag.name}
            </Badge>
          ))}
        </div>
      )}

      {/* Notes */}
      <div className="mb-6">
        <h2 className="mb-3 text-lg font-semibold">Notes</h2>
        <div className="rounded-lg border border-border bg-card p-4">
          <RichTextDisplay content={organization.notesBody as JSONContent} />
        </div>
      </div>
    </div>
  );
}
