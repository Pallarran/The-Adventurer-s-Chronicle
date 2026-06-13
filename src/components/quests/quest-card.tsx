"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { QuestStatusControl } from "@/components/quests/quest-status-control";
import { Compass, ScrollText } from "lucide-react";
import { setQuestStatus } from "@/lib/actions/quests";
import { toast } from "sonner";
import type { QuestListItem } from "@/types";
import type { QuestStatus } from "@/generated/prisma/client";

interface QuestCardProps {
  quest: QuestListItem;
}

export function QuestCard({ quest }: QuestCardProps) {
  const [status, setStatus] = useState<QuestStatus>(quest.status);
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (newStatus: QuestStatus) => {
    if (newStatus === status) return;
    const prev = status;
    setStatus(newStatus); // optimistic
    startTransition(async () => {
      try {
        const result = await setQuestStatus(quest.id, newStatus);
        if (!result.ok) {
          setStatus(prev); // revert on error
          toast.error(result.error);
        }
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
          <QuestStatusControl
            status={status}
            isPending={isPending}
            onSelect={handleStatusChange}
          />
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
