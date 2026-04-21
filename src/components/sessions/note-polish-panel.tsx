"use client";

import { useState } from "react";
import { Sparkles, Loader2, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { polishNotes } from "@/lib/actions/ai";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface NotePolishPanelProps {
  sessionId: string;
  children: React.ReactNode;
}

export function NotePolishPanel({ sessionId, children }: NotePolishPanelProps) {
  const [polishedText, setPolishedText] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handlePolish = async () => {
    setIsGenerating(true);
    setIsOpen(true);
    try {
      const result = await polishNotes(sessionId);
      setPolishedText(result);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to polish notes.";
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setPolishedText(null);
  };

  return (
    <div className="space-y-2">
      {/* Label row with Polish button */}
      <div className="flex items-center gap-3">
        <Label>Session Notes</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handlePolish}
          disabled={isGenerating}
          className="h-7 gap-1.5 text-xs"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Polishing...
            </>
          ) : polishedText && isOpen ? (
            <>
              <RefreshCw className="h-3.5 w-3.5" />
              Regenerate
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5" />
              Polish Notes
            </>
          )}
        </Button>
      </div>

      {/* Editor + side panel in flex row */}
      <div className="flex gap-4">
        <div
          className={cn(
            "min-w-0 transition-all duration-300",
            isOpen ? "flex-[55]" : "flex-1"
          )}
        >
          {children}
        </div>

        {isOpen && (
          <div className="flex min-w-0 flex-[45] flex-col rounded-md border border-border bg-card">
            {/* Panel header */}
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3" />
                AI-polished version
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-sm p-0.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Panel content */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {isGenerating && !polishedText ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Polishing your notes...
                </div>
              ) : polishedText ? (
                <div className="whitespace-pre-wrap text-sm text-foreground/90">
                  {polishedText}
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
