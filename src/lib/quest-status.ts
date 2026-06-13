import type { QuestStatus } from "@/generated/prisma/client";
import { QUEST_STATUS_LABELS } from "@/lib/colors";

/** Canonical display order for quest statuses (lifecycle progression). */
export const QUEST_STATUS_ORDER: QuestStatus[] = [
  "LEAD",
  "ACTIVE",
  "COMPLETED",
  "FAILED",
];

/** Tailwind class map for the left-border + dot styling used on quest rows. */
export const QUEST_STATUS_STYLES: Record<
  QuestStatus,
  { label: string; borderClass: string; dotClass: string }
> = {
  LEAD: { label: QUEST_STATUS_LABELS.LEAD, borderClass: "border-l-amber-500", dotClass: "bg-amber-500" },
  ACTIVE: { label: QUEST_STATUS_LABELS.ACTIVE, borderClass: "border-l-blue-500", dotClass: "bg-blue-500" },
  COMPLETED: { label: QUEST_STATUS_LABELS.COMPLETED, borderClass: "border-l-emerald-500", dotClass: "bg-emerald-500" },
  FAILED: { label: QUEST_STATUS_LABELS.FAILED, borderClass: "border-l-red-500", dotClass: "bg-red-500" },
};

/** Statuses that count as "resolved" (closed threads). */
export const RESOLVED_STATUSES: QuestStatus[] = ["COMPLETED", "FAILED"];
