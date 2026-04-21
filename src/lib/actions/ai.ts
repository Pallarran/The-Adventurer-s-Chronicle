"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { tiptapJsonToMarkdown } from "@/lib/tiptap-to-markdown";
import {
  generateSessionSummary,
  checkOllamaConnection as checkConnection,
} from "@/lib/ai";
import type { JSONContent } from "@tiptap/react";

function mdSnippet(json: unknown, maxLen = 500): string {
  const text = tiptapJsonToMarkdown(json as JSONContent).trim();
  return text.length > maxLen ? text.slice(0, maxLen) + "..." : text;
}

/**
 * Build a compact context string from the character profile
 * and the entities linked to this specific session.
 */
async function buildSessionContext(
  sessionId: string,
  campaignId: string
): Promise<string> {
  const [character, session] = await Promise.all([
    prisma.characterProfile.findUnique({
      where: { campaignId },
      select: {
        name: true,
        race: true,
        classInfo: true,
        level: true,
        summary: true,
        personality: true,
        sections: {
          where: { type: "BACKSTORY" },
          select: { content: true },
          take: 1,
        },
      },
    }),
    prisma.session.findUnique({
      where: { id: sessionId },
      select: {
        npcs: {
          include: {
            npc: {
              select: {
                name: true,
                race: true,
                classRole: true,
                alignmentStance: true,
                status: true,
              },
            },
          },
        },
        locations: {
          include: {
            location: { select: { name: true, type: true } },
          },
        },
        organizations: {
          include: {
            organization: {
              select: { name: true, type: true, alignmentStance: true },
            },
          },
        },
        quests: {
          include: {
            quest: { select: { name: true, status: true } },
          },
        },
      },
    }),
  ]);

  const parts: string[] = [];

  // Character info
  if (character) {
    const meta = [character.name, character.race, character.classInfo]
      .filter(Boolean)
      .join(" ");
    const levelStr = character.level ? `, Level ${character.level}` : "";
    parts.push(`Character: ${meta}${levelStr}`);

    if (character.summary) parts.push(`Summary: ${character.summary}`);

    if (character.personality) {
      const text = mdSnippet(character.personality, 300);
      if (text) parts.push(`Personality: ${text}`);
    }

    const backstory = character.sections[0]?.content;
    if (backstory) {
      const text = mdSnippet(backstory, 400);
      if (text) parts.push(`Backstory: ${text}`);
    }
  }

  // Session-linked entities
  if (session) {
    if (session.npcs.length > 0) {
      const list = session.npcs.map((n) => {
        const details = [n.npc.race, n.npc.classRole].filter(Boolean).join(" ");
        const meta = [details, n.npc.alignmentStance, n.npc.status]
          .filter(Boolean)
          .join(", ");
        return meta ? `${n.npc.name} (${meta})` : n.npc.name;
      });
      parts.push(`\nSession NPCs: ${list.join("; ")}`);
    }

    if (session.locations.length > 0) {
      const list = session.locations.map((l) =>
        l.location.type
          ? `${l.location.name} (${l.location.type})`
          : l.location.name
      );
      parts.push(`Session Locations: ${list.join("; ")}`);
    }

    if (session.organizations.length > 0) {
      const list = session.organizations.map((o) => {
        const meta = [o.organization.type, o.organization.alignmentStance]
          .filter(Boolean)
          .join(", ");
        return meta
          ? `${o.organization.name} (${meta})`
          : o.organization.name;
      });
      parts.push(`Session Organizations: ${list.join("; ")}`);
    }

    if (session.quests.length > 0) {
      const list = session.quests.map(
        (q) => `${q.quest.name} (${q.quest.status})`
      );
      parts.push(`Session Quests: ${list.join("; ")}`);
    }
  }

  return parts.join("\n");
}

/**
 * Generate an AI summary for a session and save it to the database.
 */
export async function generateAndSaveSummary(
  sessionId: string
): Promise<string> {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { notesBody: true, campaignId: true },
  });

  if (!session) throw new Error("Session not found.");
  if (!session.notesBody) throw new Error("Session has no notes to summarize.");

  const [markdown, context] = await Promise.all([
    Promise.resolve(tiptapJsonToMarkdown(session.notesBody as JSONContent)),
    buildSessionContext(sessionId, session.campaignId),
  ]);

  if (!markdown.trim()) throw new Error("Session notes are empty.");

  const summary = await generateSessionSummary(markdown, context);

  await prisma.session.update({
    where: { id: sessionId },
    data: { summary },
  });

  revalidatePath(`/sessions/${sessionId}`);
  revalidatePath("/dashboard");

  return summary;
}

/**
 * Check Ollama connectivity (used by settings page).
 */
export async function checkOllamaStatus() {
  return checkConnection();
}
