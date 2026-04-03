import type { JSONContent } from "@tiptap/react";

export type MentionType = "npc" | "location" | "organization" | "item" | "quest";

export interface ExtractedMention {
  id: string;
  label: string;
  mentionType: MentionType;
}

export type GroupedMentions = Record<MentionType, ExtractedMention[]>;

const EMPTY: GroupedMentions = {
  npc: [],
  location: [],
  organization: [],
  item: [],
  quest: [],
};

/**
 * Recursively walks a Tiptap JSONContent tree and collects all mention nodes,
 * grouped by mentionType. Deduplicates by ID.
 */
export function extractMentionsFromContent(
  content: JSONContent | null | undefined
): GroupedMentions {
  if (!content) return EMPTY;

  const result: GroupedMentions = {
    npc: [],
    location: [],
    organization: [],
    item: [],
    quest: [],
  };
  const seenIds = new Set<string>();

  function walk(node: JSONContent) {
    if (node.type === "mention" && node.attrs?.id && node.attrs?.mentionType) {
      const id = node.attrs.id as string;
      const mentionType = node.attrs.mentionType as string;
      const label = (node.attrs.label as string) ?? "";

      if (!seenIds.has(id) && mentionType in result) {
        seenIds.add(id);
        result[mentionType as MentionType].push({
          id,
          label,
          mentionType: mentionType as MentionType,
        });
      }
    }

    if (node.content) {
      for (const child of node.content) {
        walk(child);
      }
    }
  }

  walk(content);
  return result;
}
