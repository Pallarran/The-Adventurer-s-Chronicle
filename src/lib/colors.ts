import type { NpcStatus, AlignmentStance, QuestStatus } from "@/generated/prisma/client";

/** Gem palette — hex values for inline-style compatibility (e.g. `color + "40"` alpha). */
export const GEM = {
  emerald: "#4a9a5a",
  ruby: "#9a4a4a",
  jade: "#4a9a8a",
  sapphire: "#4a8ad4",
  amethyst: "#7a5a9a",
  citrine: "#d4a843",
  amber: "#9a8a4a",
  moonstone: "#6a6a7a",
} as const;

// ── NPC status ──────────────────────────────────────────────

export const NPC_STATUS_COLORS: Record<NpcStatus, string> = {
  ALIVE: GEM.emerald,
  DEAD: GEM.ruby,
  MISSING: GEM.amber,
  UNKNOWN: GEM.moonstone,
};

export const NPC_STATUS_LABELS: Record<NpcStatus, string> = {
  ALIVE: "Alive",
  DEAD: "Dead",
  MISSING: "Missing",
  UNKNOWN: "Unknown",
};

// ── Alignment stance (NPCs + Organizations) ────────────────

export const STANCE_COLORS: Record<AlignmentStance, string> = {
  ALLIED: GEM.emerald,
  FRIENDLY: GEM.jade,
  NEUTRAL: GEM.moonstone,
  SUSPICIOUS: GEM.amber,
  HOSTILE: GEM.ruby,
  UNKNOWN: GEM.moonstone,
};

export const STANCE_LABELS: Record<AlignmentStance, string> = {
  ALLIED: "Allied",
  FRIENDLY: "Friendly",
  NEUTRAL: "Neutral",
  SUSPICIOUS: "Suspicious",
  HOSTILE: "Hostile",
  UNKNOWN: "Unknown",
};

// ── Quest status ────────────────────────────────────────────

export const QUEST_STATUS_COLORS: Record<QuestStatus, string> = {
  LEAD: GEM.citrine,
  ACTIVE: GEM.sapphire,
  COMPLETED: GEM.emerald,
  FAILED: GEM.ruby,
};

export const QUEST_STATUS_LABELS: Record<QuestStatus, string> = {
  LEAD: "Lead",
  ACTIVE: "Active",
  COMPLETED: "Completed",
  FAILED: "Failed",
};

// ── Item rarity ────────────────────────────────────────────

export const RARITY_OPTIONS = [
  "Common",
  "Uncommon",
  "Rare",
  "Very Rare",
  "Legendary",
  "Artifact",
] as const;

export const RARITY_COLORS: Record<string, string> = {
  Common: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
  Uncommon: "bg-green-500/15 text-green-400 border-green-500/30",
  Rare: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "Very Rare": "bg-purple-500/15 text-purple-400 border-purple-500/30",
  Legendary: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  Artifact: "bg-red-500/15 text-red-400 border-red-500/30",
};

// ── Item type & aura ───────────────────────────────────────

export const ITEM_TYPE_OPTIONS = [
  "Armor",
  "Potion",
  "Ring",
  "Rod",
  "Scroll",
  "Staff",
  "Wand",
  "Weapon",
  "Wondrous Item",
] as const;

export const AURA_STRENGTH_OPTIONS = [
  "Faint",
  "Moderate",
  "Strong",
  "Overwhelming",
] as const;

export const MAGIC_SCHOOL_OPTIONS = [
  "Abjuration",
  "Conjuration",
  "Divination",
  "Enchantment",
  "Evocation",
  "Illusion",
  "Necromancy",
  "Transmutation",
] as const;
