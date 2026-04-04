import type { Prisma } from "@/generated/prisma/client";

// ── Session types ──────────────────────────────────────────────

export type SessionListItem = Prisma.SessionGetPayload<{
  include: {
    npcs: { include: { npc: { select: { id: true; name: true } } } };
    locations: { include: { location: { select: { id: true; name: true } } } };
    organizations: { include: { organization: { select: { id: true; name: true } } } };
    quests: { include: { quest: { select: { id: true; name: true; status: true; description: true } } } };
    tags: { include: { tag: true } };
  };
}>;

export type SessionDetail = Prisma.SessionGetPayload<{
  include: {
    npcs: { include: { npc: { select: { id: true; name: true } } } };
    locations: { include: { location: { select: { id: true; name: true } } } };
    organizations: { include: { organization: { select: { id: true; name: true } } } };
    quests: { include: { quest: { select: { id: true; name: true; status: true; description: true } } } };
    tags: { include: { tag: true } };
  };
}>;

// ── NPC types ──────────────────────────────────────────────────

export type NpcListItem = Prisma.NpcGetPayload<{
  include: {
    organization: { select: { id: true; name: true } };
    tags: { include: { tag: true } };
    firstAppearanceSession: { select: { id: true; sessionNumber: true } };
    lastAppearanceSession: { select: { id: true; sessionNumber: true } };
  };
}>;

export type NpcDetail = Prisma.NpcGetPayload<{
  include: {
    organization: { select: { id: true; name: true } };
    sessions: { include: { session: { select: { id: true; sessionNumber: true; title: true } } } };
    organizations: { include: { organization: { select: { id: true; name: true } } } };
    tags: { include: { tag: true } };
    firstAppearanceSession: { select: { id: true; sessionNumber: true; title: true } };
    lastAppearanceSession: { select: { id: true; sessionNumber: true; title: true } };
  };
}>;

// ── Location types ─────────────────────────────────────────────

export type LocationListItem = Prisma.LocationGetPayload<{
  include: {
    parentLocation: { select: { id: true; name: true } };
    tags: { include: { tag: true } };
    organizations: { include: { organization: { select: { id: true; name: true } } } };
    firstAppearanceSession: { select: { id: true; sessionNumber: true } };
    lastAppearanceSession: { select: { id: true; sessionNumber: true } };
  };
}>;

export type LocationDetail = Prisma.LocationGetPayload<{
  include: {
    parentLocation: { select: { id: true; name: true } };
    childLocations: { select: { id: true; name: true; type: true } };
    tags: { include: { tag: true } };
    organizations: { include: { organization: { select: { id: true; name: true } } } };
    sessions: { include: { session: { select: { id: true; sessionNumber: true; title: true } } } };
    firstAppearanceSession: { select: { id: true; sessionNumber: true; title: true } };
    lastAppearanceSession: { select: { id: true; sessionNumber: true; title: true } };
    basedOrganizations: { select: { id: true; name: true } };
  };
}>;

// ── Organization types ─────────────────────────────────────────

export type OrganizationListItem = Prisma.OrganizationGetPayload<{
  include: {
    baseLocation: { select: { id: true; name: true } };
    npcs: { include: { npc: { select: { id: true; name: true } } } };
    tags: { include: { tag: true } };
    firstAppearanceSession: { select: { id: true; sessionNumber: true } };
    lastAppearanceSession: { select: { id: true; sessionNumber: true } };
  };
}>;

// ── Item types ────────────────────────────────────────────────

export type ItemListItem = Prisma.ItemGetPayload<{
  include: {
    tags: { include: { tag: true } };
    acquiredInSession: { select: { id: true; sessionNumber: true; title: true } };
  };
}>;

export type ItemDetail = Prisma.ItemGetPayload<{
  include: {
    tags: { include: { tag: true } };
    acquiredInSession: { select: { id: true; sessionNumber: true; title: true } };
  };
}>;

// ── Organization types ─────────────────────────────────────────

// ── Quest types ──────────────────────────────────────────────

export type QuestListItem = Prisma.QuestGetPayload<{
  include: {
    sessions: { include: { session: { select: { id: true; sessionNumber: true } } } };
  };
}>;

export type QuestDetail = Prisma.QuestGetPayload<{
  include: {
    sessions: { include: { session: { select: { id: true; sessionNumber: true; title: true } } } };
  };
}>;

// ── Organization types ─────────────────────────────────────────

export type OrganizationDetail = Prisma.OrganizationGetPayload<{
  include: {
    baseLocation: { select: { id: true; name: true } };
    npcs: { include: { npc: { select: { id: true; name: true; classRole: true } } } };
    locations: { include: { location: { select: { id: true; name: true } } } };
    sessions: { include: { session: { select: { id: true; sessionNumber: true; title: true } } } };
    tags: { include: { tag: true } };
    primaryNpcs: { select: { id: true; name: true } };
    firstAppearanceSession: { select: { id: true; sessionNumber: true; title: true } };
    lastAppearanceSession: { select: { id: true; sessionNumber: true; title: true } };
  };
}>;
