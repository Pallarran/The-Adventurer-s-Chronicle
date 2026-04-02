import Link from "next/link";
import { ExternalLink, Star, Wrench, Link2 } from "lucide-react";
import { getToolLinks } from "@/lib/actions/tools";
import { ToolIcon } from "@/components/tools/tool-icon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PinnedToolsProps {
  campaignId: string;
}

export async function PinnedTools({ campaignId }: PinnedToolsProps) {
  const allTools = await getToolLinks(campaignId);
  const pinnedTools = allTools.filter((tool) => tool.pinnedToDashboard);

  if (pinnedTools.length === 0) {
    return (
      <Card className="flex h-full flex-col">
        <CardContent className="flex flex-1 flex-col items-center justify-center py-8 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 ring-1 ring-gold/10">
            <Link2 className="h-5 w-5 text-gold/80" />
          </div>
          <p className="mt-3 text-sm font-medium text-foreground">No Pinned Tools</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Pin tools from the{" "}
            <Link href="/tools" className="text-arcane-teal hover:underline">
              Tools page
            </Link>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-gold">
            <Star className="h-5 w-5" />
            Pinned Tools
          </CardTitle>
          <Link
            href="/tools"
            aria-label="Manage Tools"
            className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Wrench className="h-4 w-4" />
          </Link>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="flex flex-col gap-2">
          {pinnedTools.map((tool) => (
            <a
              key={tool.id}
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 rounded-lg border border-border bg-card/50 px-3 py-2 transition-colors hover:border-arcane-teal/30 hover:bg-arcane-teal/5"
            >
              <ToolIcon url={tool.url} className="h-4 w-4 shrink-0 text-arcane-teal" />
              <span className="truncate text-sm font-medium text-foreground group-hover:text-arcane-teal">
                {tool.name}
              </span>
              <ExternalLink className="ml-auto h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
