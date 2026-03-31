import Link from "next/link";
import { Link2, ExternalLink, Star, Wrench } from "lucide-react";
import { getToolLinks } from "@/lib/actions/tools";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PinnedToolsProps {
  campaignId: string;
}

export async function PinnedTools({ campaignId }: PinnedToolsProps) {
  const allTools = await getToolLinks(campaignId);
  const pinnedTools = allTools.filter((tool) => tool.pinnedToDashboard);

  if (pinnedTools.length === 0) {
    return (
      <EmptyState
        icon={Link2}
        title="No Pinned Tools"
        description="Pin your favorite external tools and resources to quickly access them from the dashboard."
      >
        <Link
          href="/tools"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          <Wrench className="mr-2 h-4 w-4" />
          Manage Tools
        </Link>
      </EmptyState>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-gold">
            <Star className="h-5 w-5" />
            Pinned Tools
          </CardTitle>
          <Link
            href="/tools"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "text-muted-foreground hover:text-foreground"
            )}
          >
            Manage Tools
          </Link>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-wrap gap-3">
          {pinnedTools.map((tool) => (
            <a
              key={tool.id}
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 rounded-lg border border-border bg-card/50 px-4 py-3 transition-colors hover:border-arcane-teal/30 hover:bg-arcane-teal/5"
            >
              <Link2 className="h-4 w-4 shrink-0 text-arcane-teal" />
              <span className="text-sm font-medium text-foreground group-hover:text-arcane-teal">
                {tool.name}
              </span>
              <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
