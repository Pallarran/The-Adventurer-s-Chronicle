import Link from "next/link";
import { BookOpen, CalendarDays, ArrowRight } from "lucide-react";
import { getSessions } from "@/lib/actions/sessions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LastSessionRecapProps {
  campaignId: string;
}

/**
 * Extracts plain text from Tiptap JSON content, recursively walking the node tree.
 */
function extractTextFromJson(json: unknown, maxLength: number = 200): string {
  if (!json || typeof json !== "object") return "";

  const node = json as { type?: string; text?: string; content?: unknown[] };

  if (node.text) return node.text;

  if (Array.isArray(node.content)) {
    let result = "";
    for (const child of node.content) {
      result += extractTextFromJson(child, maxLength);
      if (result.length >= maxLength) break;
    }
    return result;
  }

  return "";
}

export async function LastSessionRecap({ campaignId }: LastSessionRecapProps) {
  const sessions = await getSessions(campaignId, {
    sortBy: "sessionNumber",
    sortOrder: "desc",
  });

  const latestSession = sessions[0] ?? null;

  if (!latestSession) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No Sessions Yet"
        description="Log your first session to see a recap here on your dashboard."
        className="h-full"
      >
        <Link
          href="/sessions/new"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          <BookOpen className="mr-2 h-4 w-4" />
          Log First Session
        </Link>
      </EmptyState>
    );
  }

  const notesText = latestSession.notesBody
    ? extractTextFromJson(latestSession.notesBody, 200)
    : "";

  const formattedDate = new Date(latestSession.realDatePlayed).toLocaleDateString(
    "en-US",
    { month: "short", day: "numeric", year: "numeric" }
  );

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gold">
          <BookOpen className="h-5 w-5" />
          Last Session
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">
              Session {latestSession.sessionNumber}
            </Badge>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="h-3 w-3" />
              {formattedDate}
            </span>
          </div>
          {latestSession.title && (
            <h3 className="mt-2 text-base font-semibold text-foreground">
              {latestSession.title}
            </h3>
          )}
        </div>

        <p className="line-clamp-4 flex-1 text-sm text-muted-foreground">
          {notesText
            ? notesText.length > 200
              ? notesText.slice(0, 200) + "..."
              : notesText
            : "No notes recorded for this session."}
        </p>

        <div className="mt-auto pt-2">
          <Link
            href={`/sessions/${latestSession.id}`}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "text-gold hover:text-gold/80"
            )}
          >
            View Full Session
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
