"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Compass, ScrollText, ChevronDown } from "lucide-react";
import { updateQuest } from "@/lib/actions/quests";
import { QUEST_STATUS_COLORS, QUEST_STATUS_LABELS } from "@/lib/colors";
import type { QuestListItem } from "@/types";
import type { QuestStatus } from "@/generated/prisma/client";

const STATUS_OPTIONS: { value: QuestStatus; label: string; color: string }[] = [
  { value: "LEAD", label: QUEST_STATUS_LABELS.LEAD, color: QUEST_STATUS_COLORS.LEAD },
  { value: "ACTIVE", label: QUEST_STATUS_LABELS.ACTIVE, color: QUEST_STATUS_COLORS.ACTIVE },
  { value: "COMPLETED", label: QUEST_STATUS_LABELS.COMPLETED, color: QUEST_STATUS_COLORS.COMPLETED },
  { value: "FAILED", label: QUEST_STATUS_LABELS.FAILED, color: QUEST_STATUS_COLORS.FAILED },
];

interface QuestCardProps {
  quest: QuestListItem;
}

export function QuestCard({ quest }: QuestCardProps) {
  const [status, setStatus] = useState<QuestStatus>(quest.status);
  const [isPending, startTransition] = useTransition();
  const statusColor = QUEST_STATUS_COLORS[status] ?? "#6a6a7a";

  const handleStatusChange = (newStatus: QuestStatus) => {
    if (newStatus === status) return;
    const prev = status;
    setStatus(newStatus); // optimistic
    startTransition(async () => {
      try {
        await updateQuest(quest.id, { status: newStatus });
      } catch {
        setStatus(prev); // revert on error
      }
    });
  };

  return (
    <Link href={`/quests/${quest.id}`}>
      <Card className="h-full overflow-hidden transition-colors hover:border-gem-jade/30 hover:bg-card/80 hover:shadow-lg hover:shadow-gem-jade/10">
        {/* Status bar */}
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <Compass className="h-4 w-4 text-muted-foreground/50" />

          <DropdownMenu>
            <DropdownMenuTrigger
              className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium transition-colors hover:opacity-80 border-transparent"
              style={{
                backgroundColor: `${statusColor}20`,
                color: statusColor,
                borderColor: `${statusColor}40`,
              }}
              onClick={(e) => e.preventDefault()}
            >
              {QUEST_STATUS_LABELS[status] ?? status}
              <ChevronDown className="h-3 w-3" style={{ opacity: isPending ? 0.5 : 1 }} />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              {STATUS_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onClick={() => handleStatusChange(opt.value)}
                  className="gap-2 text-xs"
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: opt.color }}
                  />
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content */}
        <div className="px-3 py-2">
          <p className="truncate text-sm font-bold">{quest.name}</p>
          {quest.description ? (
            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
              {quest.description}
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-muted-foreground/50 italic">
              No description
            </p>
          )}

          {quest.sessions.length > 0 && (
            <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
              <ScrollText className="h-3 w-3" />
              {quest.sessions.length} session{quest.sessions.length !== 1 && "s"}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
