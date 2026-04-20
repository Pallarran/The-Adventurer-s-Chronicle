"use client";

import { useState } from "react";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateAndSaveSummary } from "@/lib/actions/ai";
import { toast } from "sonner";

interface SessionSummaryBlockProps {
  sessionId: string;
  summary: string | null;
  hasNotes: boolean;
}

export function SessionSummaryBlock({
  sessionId,
  summary: initialSummary,
  hasNotes,
}: SessionSummaryBlockProps) {
  const [summary, setSummary] = useState(initialSummary);
  const [generating, setGenerating] = useState(false);

  if (!hasNotes) return null;

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const result = await generateAndSaveSummary(sessionId);
      setSummary(result);
      toast.success("Summary generated.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to generate summary.";
      toast.error(message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center gap-3">
        <h2 className="text-lg font-semibold">Session Summary</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerate}
          disabled={generating}
          className="h-7 gap-1.5 text-xs"
        >
          {generating ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Generating...
            </>
          ) : summary ? (
            <>
              <RefreshCw className="h-3.5 w-3.5" />
              Regenerate
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5" />
              Generate Summary
            </>
          )}
        </Button>
      </div>

      {summary && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-2 flex items-center gap-1.5 text-[11px] text-muted-foreground/50">
            <Sparkles className="h-3 w-3" />
            AI-generated
          </div>
          <div className="whitespace-pre-line text-sm text-foreground/90">
            {summary}
          </div>
        </div>
      )}
    </div>
  );
}
