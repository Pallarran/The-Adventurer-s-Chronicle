"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { QuestStatusControl } from "@/components/quests/quest-status-control";
import { setQuestStatus } from "@/lib/actions/quests";
import { QUEST_STATUS_STYLES } from "@/lib/quest-status";
import type { QuestStatus } from "@/generated/prisma/client";

interface SessionQuestRowProps {
  questId: string;
  sessionId: string;
  name: string;
  description: string | null;
  initialStatus: QuestStatus;
}

/** A quest row on the session detail page with inline, session-stamped status editing. */
export function SessionQuestRow({
  questId,
  sessionId,
  name,
  description,
  initialStatus,
}: SessionQuestRowProps) {
  const [status, setStatus] = useState<QuestStatus>(initialStatus);
  const [isPending, startTransition] = useTransition();
  const styles = QUEST_STATUS_STYLES[status];

  const handleSelect = (newStatus: QuestStatus) => {
    if (newStatus === status) return;
    const prev = status;
    setStatus(newStatus); // optimistic
    startTransition(async () => {
      try {
        const result = await setQuestStatus(questId, newStatus, { sessionId });
        if (!result.ok) {
          setStatus(prev);
          toast.error(result.error);
        }
      } catch {
        setStatus(prev);
      }
    });
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 border-l-2 px-3 py-2 text-sm transition-colors hover:bg-muted/30",
        styles.borderClass
      )}
    >
      <QuestStatusControl status={status} isPending={isPending} onSelect={handleSelect} />
      <Link
        href={`/quests/${questId}`}
        className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden hover:underline"
      >
        <span className="shrink-0 font-medium">{name}</span>
        <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{description || ""}</span>
      </Link>
    </div>
  );
}
