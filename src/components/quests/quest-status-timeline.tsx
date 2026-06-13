"use client";

import Link from "next/link";
import { ScrollText, StickyNote } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { badgeVariants } from "@/components/ui/badge";
import { QUEST_STATUS_COLORS, QUEST_STATUS_LABELS } from "@/lib/colors";
import type { QuestStatus } from "@/generated/prisma/client";

export interface TimelineNode {
  id: string;
  status: QuestStatus;
  isCreation: boolean;
  sessionId: string | null;
  sessionNumber: number | null;
  sessionTitle: string | null;
  note: string | null;
}

/** Horizontal status-history rail: one dot per milestone, notes on hover. */
export function QuestStatusTimeline({ nodes }: { nodes: TimelineNode[] }) {
  const last = nodes.length - 1;

  return (
    <TooltipProvider delay={150}>
      <div className="flex overflow-x-auto pb-1">
        {nodes.map((n, i) => {
          const color = QUEST_STATUS_COLORS[n.status];
          return (
            <div
              key={n.id}
              className="relative flex min-w-[8.5rem] flex-1 flex-col items-center px-2 text-center"
            >
              {/* Rail connectors (half-segments meet under the dot) */}
              {i > 0 && (
                <span aria-hidden className="absolute left-0 right-1/2 top-[7px] h-0.5 bg-border" />
              )}
              {i < last && (
                <span aria-hidden className="absolute left-1/2 right-0 top-[7px] h-0.5 bg-border" />
              )}

              {/* Node dot */}
              <span
                className="relative z-10 h-4 w-4 shrink-0 rounded-full ring-2 ring-card"
                style={{ backgroundColor: color }}
              />

              {/* Labels */}
              <span className="mt-2 text-sm font-medium" style={{ color }}>
                {QUEST_STATUS_LABELS[n.status]}
              </span>
              {n.isCreation && (
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground/70">
                  created
                </span>
              )}
              {n.sessionId ? (
                <>
                  <Link
                    href={`/sessions/${n.sessionId}`}
                    className={cn(badgeVariants({ variant: "secondary" }), "mt-1 max-w-full")}
                  >
                    <ScrollText className="mr-1 h-3 w-3 shrink-0" />
                    <span className="truncate">#{n.sessionNumber}</span>
                  </Link>
                  {n.sessionTitle && (
                    <span
                      title={n.sessionTitle}
                      className="mt-0.5 line-clamp-2 text-[11px] leading-tight text-muted-foreground"
                    >
                      {n.sessionTitle}
                    </span>
                  )}
                </>
              ) : (
                <span className="mt-1 text-[11px] text-muted-foreground/50">no session</span>
              )}

              {/* Note marker (hover to read) */}
              {n.note && (
                <Tooltip>
                  <TooltipTrigger
                    className="mt-1 inline-flex items-center text-muted-foreground/60 transition-colors hover:text-foreground"
                    aria-label="Show note"
                  >
                    <StickyNote className="h-3.5 w-3.5" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">{n.note}</TooltipContent>
                </Tooltip>
              )}
            </div>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
