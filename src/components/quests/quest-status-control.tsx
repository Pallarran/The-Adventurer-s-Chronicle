"use client";

import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { QUEST_STATUS_COLORS, QUEST_STATUS_LABELS } from "@/lib/colors";
import { QUEST_STATUS_ORDER } from "@/lib/quest-status";
import type { QuestStatus } from "@/generated/prisma/client";

interface QuestStatusControlProps {
  status: QuestStatus;
  isPending?: boolean;
  onSelect: (status: QuestStatus) => void;
  align?: "start" | "center" | "end";
}

/**
 * Presentational one-click status badge + dropdown. No data logic — the
 * consumer wires `onSelect` to its own optimistic update (e.g. setQuestStatus).
 * Stops click propagation so it can live inside/next to links.
 */
export function QuestStatusControl({
  status,
  isPending = false,
  onSelect,
  align = "start",
}: QuestStatusControlProps) {
  const color = QUEST_STATUS_COLORS[status] ?? "#6a6a7a";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium transition-colors hover:opacity-80 border-transparent"
        style={{
          backgroundColor: `${color}20`,
          color,
          borderColor: `${color}40`,
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {QUEST_STATUS_LABELS[status] ?? status}
        <ChevronDown className="h-3 w-3" style={{ opacity: isPending ? 0.5 : 1 }} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {QUEST_STATUS_ORDER.map((value) => (
          <DropdownMenuItem
            key={value}
            onClick={() => onSelect(value)}
            className="gap-2 text-xs"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: QUEST_STATUS_COLORS[value] }}
            />
            {QUEST_STATUS_LABELS[value]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
