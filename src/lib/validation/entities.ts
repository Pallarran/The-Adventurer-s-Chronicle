import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";

// ── Shared field schemas ──────────────────────────────────────

/** Tiptap JSON blobs — shape is owned by the editor, not validated here. */
const jsonValue = z.custom<Prisma.JsonValue>(() => true);

const id = z.string().min(1, "Missing id.");
const requiredName = z
  .string({ error: "Name is required." })
  .trim()
  .min(1, "Name is required.")
  .max(200, "Name is too long (max 200 characters).");
const shortText = z.string().trim().max(500, "Too long (max 500 characters).");

const npcStatus = z.enum(["ALIVE", "DEAD", "MISSING", "UNKNOWN"]);
const alignmentStance = z.enum([
  "ALLIED",
  "FRIENDLY",
  "NEUTRAL",
  "SUSPICIOUS",
  "HOSTILE",
  "UNKNOWN",
]);
const questStatus = z.enum(["LEAD", "ACTIVE", "COMPLETED", "FAILED"]);

// ── NPC ───────────────────────────────────────────────────────

export const npcCreateSchema = z.object({
  campaignId: id,
  name: requiredName,
  aliasTitle: shortText.optional(),
  gender: shortText.optional(),
  classRole: shortText.optional(),
  race: shortText.optional(),
  status: npcStatus.optional(),
  alignmentStance: alignmentStance.optional(),
  partyMember: z.boolean().optional(),
  organizationId: id.optional(),
  currentLocationId: id.optional(),
  notesBody: jsonValue.optional(),
  mainImage: z.string().optional(),
});

export const npcUpdateSchema = z.object({
  name: requiredName.optional(),
  aliasTitle: shortText.nullish(),
  gender: shortText.nullish(),
  classRole: shortText.nullish(),
  race: shortText.nullish(),
  status: npcStatus.optional(),
  alignmentStance: alignmentStance.optional(),
  partyMember: z.boolean().optional(),
  organizationId: id.nullish(),
  currentLocationId: id.nullish(),
  notesBody: jsonValue.optional(),
  mainImage: z.string().nullish(),
});

export type CreateNpcData = z.input<typeof npcCreateSchema>;
export type UpdateNpcData = z.input<typeof npcUpdateSchema>;

// ── Location ──────────────────────────────────────────────────

export const locationCreateSchema = z.object({
  campaignId: id,
  name: requiredName,
  aliasTitle: shortText.optional(),
  type: shortText.optional(),
  parentLocationId: id.optional(),
  notesBody: jsonValue.optional(),
  mainImage: z.string().optional(),
  organizationIds: z.array(id).optional(),
});

export const locationUpdateSchema = z.object({
  name: requiredName.optional(),
  aliasTitle: shortText.nullish(),
  type: shortText.nullish(),
  parentLocationId: id.nullish(),
  notesBody: jsonValue.optional(),
  mainImage: z.string().nullish(),
  organizationIds: z.array(id).optional(),
});

export type CreateLocationData = z.input<typeof locationCreateSchema>;
export type UpdateLocationData = z.input<typeof locationUpdateSchema>;

// ── Organization ──────────────────────────────────────────────

export const organizationCreateSchema = z.object({
  campaignId: id,
  name: requiredName,
  type: shortText.optional(),
  alignmentStance: alignmentStance.optional(),
  baseLocationId: id.optional(),
  notesBody: jsonValue.optional(),
  mainImage: z.string().optional(),
  npcIds: z.array(id).optional(),
});

export const organizationUpdateSchema = z.object({
  name: requiredName.optional(),
  type: shortText.nullish(),
  alignmentStance: alignmentStance.optional(),
  baseLocationId: id.nullish(),
  notesBody: jsonValue.optional(),
  mainImage: z.string().nullish(),
  npcIds: z.array(id).optional(),
});

export type CreateOrganizationData = z.input<typeof organizationCreateSchema>;
export type UpdateOrganizationData = z.input<typeof organizationUpdateSchema>;

// ── Item ──────────────────────────────────────────────────────

export const itemCreateSchema = z.object({
  campaignId: id,
  name: requiredName,
  type: shortText.optional(),
  rarity: shortText.optional(),
  aura: shortText.optional(),
  attunement: z.boolean().optional(),
  sold: z.boolean().optional(),
  notesBody: jsonValue.optional(),
  mainImage: z.string().optional(),
  acquiredInSessionId: id.optional(),
});

export const itemUpdateSchema = z.object({
  name: requiredName.optional(),
  type: shortText.nullish(),
  rarity: shortText.nullish(),
  aura: shortText.nullish(),
  attunement: z.boolean().optional(),
  sold: z.boolean().optional(),
  notesBody: jsonValue.optional(),
  mainImage: z.string().nullish(),
  acquiredInSessionId: id.nullish(),
});

export type CreateItemData = z.input<typeof itemCreateSchema>;
export type UpdateItemData = z.input<typeof itemUpdateSchema>;

// ── Quest ─────────────────────────────────────────────────────

export const questCreateSchema = z.object({
  campaignId: id,
  name: requiredName,
  description: z.string().trim().max(5000, "Description is too long.").optional(),
  status: questStatus.optional(),
  questGiverNpcId: id.optional(),
  // Session this quest was first noted in — stamps the creation status-history entry.
  originSessionId: id.optional(),
});

export const questUpdateSchema = z.object({
  name: requiredName.optional(),
  description: z.string().trim().max(5000, "Description is too long.").nullish(),
  status: questStatus.optional(),
  questGiverNpcId: id.nullish(),
});

export type CreateQuestData = z.input<typeof questCreateSchema>;
export type UpdateQuestData = z.input<typeof questUpdateSchema>;

// ── Session ───────────────────────────────────────────────────

export const sessionCreateSchema = z.object({
  campaignId: id,
  sessionNumber: z
    .number({ error: "Session number is required." })
    .int("Session number must be a whole number.")
    .min(0, "Session number can't be negative."),
  title: shortText.optional(),
  realDatePlayed: z.coerce.date({ error: "Date played is required." }),
  inGameDate: shortText.optional(),
  notesBody: jsonValue.optional(),
  npcIds: z.array(id).optional(),
  locationIds: z.array(id).optional(),
  organizationIds: z.array(id).optional(),
  questIds: z.array(id).optional(),
});

export const sessionUpdateSchema = z.object({
  sessionNumber: z
    .number()
    .int("Session number must be a whole number.")
    .min(0, "Session number can't be negative.")
    .optional(),
  title: shortText.nullish(),
  realDatePlayed: z.coerce.date().optional(),
  inGameDate: shortText.nullish(),
  notesBody: jsonValue.optional(),
  npcIds: z.array(id).optional(),
  locationIds: z.array(id).optional(),
  organizationIds: z.array(id).optional(),
  questIds: z.array(id).optional(),
});

export type CreateSessionData = z.input<typeof sessionCreateSchema>;
export type UpdateSessionData = z.input<typeof sessionUpdateSchema>;
