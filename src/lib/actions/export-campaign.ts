"use server";

import { prisma } from "@/lib/prisma";
import { tiptapJsonToMarkdown } from "@/lib/tiptap-to-markdown";
import type { JSONContent } from "@tiptap/react";

const STANCE_LABEL: Record<string, string> = {
  ALLIED: "Allied",
  FRIENDLY: "Friendly",
  NEUTRAL: "Neutral",
  SUSPICIOUS: "Suspicious",
  HOSTILE: "Hostile",
  UNKNOWN: "Unknown",
};

const NPC_STATUS_LABEL: Record<string, string> = {
  ALIVE: "Alive",
  DEAD: "Dead",
  MISSING: "Missing",
  UNKNOWN: "Unknown",
};

const QUEST_STATUS_LABEL: Record<string, string> = {
  LEAD: "Lead",
  ACTIVE: "Active",
  COMPLETED: "Completed",
  FAILED: "Failed",
};

function md(json: unknown): string {
  const text = tiptapJsonToMarkdown(json as JSONContent);
  return text.trim();
}

function sessionRef(s: { sessionNumber: number; title?: string | null }): string {
  return s.title ? `Session ${s.sessionNumber} (${s.title})` : `Session ${s.sessionNumber}`;
}

export async function exportCampaignMarkdown(
  campaignId: string
): Promise<string> {
  const [campaign, character, npcs, locations, organizations, items, quests, sessions] =
    await Promise.all([
      prisma.campaign.findUnique({ where: { id: campaignId } }),
      prisma.characterProfile.findUnique({
        where: { campaignId },
        include: { sections: true },
      }),
      prisma.npc.findMany({
        where: { campaignId, deletedAt: null },
        include: {
          organization: { select: { name: true } },
          firstAppearanceSession: { select: { sessionNumber: true, title: true } },
          lastAppearanceSession: { select: { sessionNumber: true, title: true } },
        },
        orderBy: { name: "asc" },
      }),
      prisma.location.findMany({
        where: { campaignId, deletedAt: null },
        include: {
          parentLocation: { select: { name: true } },
          firstAppearanceSession: { select: { sessionNumber: true, title: true } },
          lastAppearanceSession: { select: { sessionNumber: true, title: true } },
        },
        orderBy: { name: "asc" },
      }),
      prisma.organization.findMany({
        where: { campaignId, deletedAt: null },
        include: {
          baseLocation: { select: { name: true } },
          npcs: { include: { npc: { select: { name: true } } } },
          firstAppearanceSession: { select: { sessionNumber: true, title: true } },
          lastAppearanceSession: { select: { sessionNumber: true, title: true } },
        },
        orderBy: { name: "asc" },
      }),
      prisma.item.findMany({
        where: { campaignId, deletedAt: null },
        include: {
          acquiredInSession: { select: { sessionNumber: true, title: true } },
        },
        orderBy: { name: "asc" },
      }),
      prisma.quest.findMany({
        where: { campaignId, deletedAt: null },
        include: {
          sessions: {
            include: { session: { select: { sessionNumber: true } } },
            orderBy: { session: { sessionNumber: "asc" } },
          },
        },
        orderBy: { name: "asc" },
      }),
      prisma.session.findMany({
        where: { campaignId, deletedAt: null },
        include: {
          npcs: { include: { npc: { select: { name: true } } } },
          locations: { include: { location: { select: { name: true } } } },
          organizations: { include: { organization: { select: { name: true } } } },
          quests: { include: { quest: { select: { name: true, status: true } } } },
        },
        orderBy: { sessionNumber: "asc" },
      }),
    ]);

  if (!campaign) throw new Error("Campaign not found");

  const now = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const parts: string[] = [];

  // ── Header ──
  parts.push(`# ${campaign.name} — Campaign Export`);
  parts.push(`> Exported on ${now}. This document contains the complete campaign data.`);
  if (campaign.description) parts.push(campaign.description);

  // ── Character Profile ──
  if (character) {
    parts.push("---\n\n## Character Profile");

    const meta: string[] = [];
    if (character.name) meta.push(`**Name:** ${character.name}`);
    if (character.classInfo) meta.push(`**Class:** ${character.classInfo}`);
    if (character.race) meta.push(`**Race:** ${character.race}`);
    if (character.level) meta.push(`**Level:** ${character.level}`);
    if (meta.length) parts.push(meta.join(" | "));

    if (character.summary) parts.push(character.summary);

    const rpFields: Array<{ key: string; label: string }> = [
      { key: "personality", label: "Personality" },
      { key: "ideals", label: "Ideals" },
      { key: "bonds", label: "Bonds" },
      { key: "flaws", label: "Flaws" },
      { key: "voiceMannerisms", label: "Voice & Mannerisms" },
      { key: "compass", label: "The Compass" },
      { key: "contradictions", label: "Contradictions" },
      { key: "pocketPhrases", label: "Pocket Phrases" },
      { key: "reminders", label: "Reminders / At the Table" },
      { key: "currentGoals", label: "Current Goals" },
      { key: "fears", label: "Fears & Motivations" },
    ];
    for (const { key, label } of rpFields) {
      const val = character[key as keyof typeof character];
      if (val) {
        const text = md(val);
        if (text) parts.push(`### ${label}\n${text}`);
      }
    }

    // Sections (OVERVIEW, BUILD, BACKSTORY)
    for (const section of character.sections) {
      if (section.content) {
        const text = md(section.content);
        if (text) {
          const sectionLabel =
            section.type === "BACKSTORY" ? "Backstory" :
            section.type === "OVERVIEW" ? "Overview" : "Build";
          parts.push(`### ${sectionLabel}\n${text}`);
        }
      }
    }
  }

  // ── NPCs ──
  if (npcs.length > 0) {
    parts.push(`---\n\n## NPCs (${npcs.length})`);

    for (const npc of npcs) {
      const heading = npc.aliasTitle
        ? `### ${npc.name} — "${npc.aliasTitle}"`
        : `### ${npc.name}`;
      parts.push(heading);

      const line1: string[] = [];
      if (npc.race || npc.classRole) {
        line1.push(`**Race/Class:** ${[npc.race, npc.classRole].filter(Boolean).join(" ")}`);
      }
      line1.push(`**Status:** ${NPC_STATUS_LABEL[npc.status] ?? npc.status}`);
      line1.push(`**Stance:** ${STANCE_LABEL[npc.alignmentStance] ?? npc.alignmentStance}`);
      parts.push(`- ${line1.join(" | ")}`);

      const line2: string[] = [];
      if (npc.organization) line2.push(`**Organization:** ${npc.organization.name}`);
      if (npc.partyMember) line2.push("**Party Member:** Yes");
      if (npc.gender) line2.push(`**Gender:** ${npc.gender}`);
      if (line2.length) parts.push(`- ${line2.join(" | ")}`);

      const appearances: string[] = [];
      if (npc.firstAppearanceSession) appearances.push(`**First Seen:** ${sessionRef(npc.firstAppearanceSession)}`);
      if (npc.lastAppearanceSession) appearances.push(`**Last Seen:** ${sessionRef(npc.lastAppearanceSession)}`);
      if (appearances.length) parts.push(`- ${appearances.join(" | ")}`);

      if (npc.notesBody) {
        const text = md(npc.notesBody);
        if (text) parts.push(`\n${text}`);
      }
    }
  }

  // ── Locations ──
  if (locations.length > 0) {
    parts.push(`---\n\n## Locations (${locations.length})`);

    for (const loc of locations) {
      const heading = loc.aliasTitle
        ? `### ${loc.name} — "${loc.aliasTitle}"`
        : `### ${loc.name}`;
      parts.push(heading);

      const meta: string[] = [];
      if (loc.type) meta.push(`**Type:** ${loc.type}`);
      if (loc.parentLocation) meta.push(`**Parent:** ${loc.parentLocation.name}`);
      if (meta.length) parts.push(`- ${meta.join(" | ")}`);

      const appearances: string[] = [];
      if (loc.firstAppearanceSession) appearances.push(`**First Seen:** ${sessionRef(loc.firstAppearanceSession)}`);
      if (loc.lastAppearanceSession) appearances.push(`**Last Seen:** ${sessionRef(loc.lastAppearanceSession)}`);
      if (appearances.length) parts.push(`- ${appearances.join(" | ")}`);

      if (loc.notesBody) {
        const text = md(loc.notesBody);
        if (text) parts.push(`\n${text}`);
      }
    }
  }

  // ── Organizations ──
  if (organizations.length > 0) {
    parts.push(`---\n\n## Organizations (${organizations.length})`);

    for (const org of organizations) {
      parts.push(`### ${org.name}`);

      const meta: string[] = [];
      if (org.type) meta.push(`**Type:** ${org.type}`);
      meta.push(`**Stance:** ${STANCE_LABEL[org.alignmentStance] ?? org.alignmentStance}`);
      if (org.baseLocation) meta.push(`**Base:** ${org.baseLocation.name}`);
      parts.push(`- ${meta.join(" | ")}`);

      if (org.npcs.length > 0) {
        parts.push(`- **Members:** ${org.npcs.map((n) => n.npc.name).join(", ")}`);
      }

      const appearances: string[] = [];
      if (org.firstAppearanceSession) appearances.push(`**First Seen:** ${sessionRef(org.firstAppearanceSession)}`);
      if (org.lastAppearanceSession) appearances.push(`**Last Seen:** ${sessionRef(org.lastAppearanceSession)}`);
      if (appearances.length) parts.push(`- ${appearances.join(" | ")}`);

      if (org.notesBody) {
        const text = md(org.notesBody);
        if (text) parts.push(`\n${text}`);
      }
    }
  }

  // ── Items ──
  if (items.length > 0) {
    parts.push(`---\n\n## Items (${items.length})`);

    for (const item of items) {
      parts.push(`### ${item.name}`);

      const meta: string[] = [];
      if (item.type) meta.push(`**Type:** ${item.type}`);
      if (item.rarity) meta.push(`**Rarity:** ${item.rarity}`);
      if (item.aura) meta.push(`**Aura:** ${item.aura}`);
      if (meta.length) parts.push(`- ${meta.join(" | ")}`);

      const line2: string[] = [];
      if (item.attunement) line2.push("**Attunement:** Yes");
      line2.push(`**Status:** ${item.sold ? "Sold" : "In inventory"}`);
      if (item.acquiredInSession) line2.push(`**Acquired:** ${sessionRef(item.acquiredInSession)}`);
      parts.push(`- ${line2.join(" | ")}`);

      if (item.notesBody) {
        const text = md(item.notesBody);
        if (text) parts.push(`\n${text}`);
      }
    }
  }

  // ── Quests ──
  if (quests.length > 0) {
    parts.push(`---\n\n## Quests (${quests.length})`);

    for (const quest of quests) {
      parts.push(`### ${quest.name} — ${QUEST_STATUS_LABEL[quest.status] ?? quest.status}`);

      if (quest.description) parts.push(quest.description);

      if (quest.sessions.length > 0) {
        const nums = quest.sessions.map((s) => `#${s.session.sessionNumber}`).join(", ");
        parts.push(`**Linked Sessions:** ${nums}`);
      }
    }
  }

  // ── Sessions ──
  if (sessions.length > 0) {
    parts.push(`---\n\n## Sessions (${sessions.length})`);

    for (const session of sessions) {
      const title = session.title
        ? `### Session ${session.sessionNumber}: ${session.title}`
        : `### Session ${session.sessionNumber}`;
      parts.push(title);

      const datePlayed = new Date(session.realDatePlayed).toLocaleDateString(
        "en-US",
        { month: "short", day: "numeric", year: "numeric" }
      );
      const dateLine = session.inGameDate
        ? `**Date Played:** ${datePlayed} | **In-Game Date:** ${session.inGameDate}`
        : `**Date Played:** ${datePlayed}`;
      parts.push(dateLine);

      // Featured entities on one line each
      const featured: string[] = [];
      if (session.npcs.length > 0) {
        featured.push(`**NPCs:** ${session.npcs.map((n) => n.npc.name).join(", ")}`);
      }
      if (session.locations.length > 0) {
        featured.push(`**Locations:** ${session.locations.map((l) => l.location.name).join(", ")}`);
      }
      if (session.organizations.length > 0) {
        featured.push(`**Organizations:** ${session.organizations.map((o) => o.organization.name).join(", ")}`);
      }
      if (session.quests.length > 0) {
        featured.push(
          `**Quests:** ${session.quests
            .map((q) => `${q.quest.name} (${QUEST_STATUS_LABEL[q.quest.status] ?? q.quest.status})`)
            .join(", ")}`
        );
      }
      if (featured.length) parts.push(featured.join("\n"));

      if (session.notesBody) {
        const text = md(session.notesBody);
        if (text) parts.push(`\n${text}`);
      }
    }
  }

  return parts.join("\n\n") + "\n";
}
