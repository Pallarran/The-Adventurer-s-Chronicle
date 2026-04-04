"use server";

import { prisma } from "@/lib/prisma";
import { tiptapJsonToMarkdown } from "@/lib/tiptap-to-markdown";
import type { JSONContent } from "@tiptap/react";

const sessionExportInclude = {
  npcs: { include: { npc: { select: { id: true, name: true } } } },
  locations: { include: { location: { select: { id: true, name: true } } } },
  organizations: { include: { organization: { select: { id: true, name: true } } } },
  quests: { include: { quest: { select: { id: true, name: true, status: true } } } },
} as const;

const STATUS_LABEL: Record<string, string> = {
  LEAD: "Lead",
  ACTIVE: "Active",
  COMPLETED: "Completed",
  FAILED: "Failed",
};

export async function exportAllSessionsMarkdown(
  campaignId: string
): Promise<string> {
  const sessions = await prisma.session.findMany({
    where: { campaignId, deletedAt: null },
    include: sessionExportInclude,
    orderBy: { sessionNumber: "asc" },
  });

  const parts: string[] = ["# Campaign Session Notes"];

  for (const session of sessions) {
    parts.push("---");

    // Title
    const title = session.title
      ? `## Session ${session.sessionNumber}: ${session.title}`
      : `## Session ${session.sessionNumber}`;
    parts.push(title);

    // Metadata
    const datePlayed = new Date(session.realDatePlayed).toLocaleDateString(
      "en-US",
      { month: "short", day: "numeric", year: "numeric" }
    );
    parts.push(`**Date Played:** ${datePlayed}`);
    if (session.inGameDate) {
      parts.push(`**In-Game Date:** ${session.inGameDate}`);
    }
    // Linked entities
    if (session.npcs.length > 0) {
      parts.push(
        "### Featured NPCs\n" +
          session.npcs.map((n) => `- ${n.npc.name}`).join("\n")
      );
    }
    if (session.locations.length > 0) {
      parts.push(
        "### Featured Locations\n" +
          session.locations.map((l) => `- ${l.location.name}`).join("\n")
      );
    }
    if (session.organizations.length > 0) {
      parts.push(
        "### Featured Organizations\n" +
          session.organizations
            .map((o) => `- ${o.organization.name}`)
            .join("\n")
      );
    }
    if (session.quests.length > 0) {
      parts.push(
        "### Quests & Goals\n" +
          session.quests
            .map(
              (q) =>
                `- ${q.quest.name} (${STATUS_LABEL[q.quest.status] ?? q.quest.status})`
            )
            .join("\n")
      );
    }

    // Notes body
    if (session.notesBody) {
      parts.push(
        "### Session Notes\n" +
          tiptapJsonToMarkdown(session.notesBody as JSONContent)
      );
    }
  }

  return parts.join("\n\n") + "\n";
}
