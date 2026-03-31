"use client";

import { useCallback, useRef, useState } from "react";
import { StickyNote, Check, Loader2 } from "lucide-react";
import { updateQuickNote } from "@/lib/actions/quick-notes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import type { JSONContent } from "@tiptap/react";

interface QuickNotesCardProps {
  quickNote: {
    id: string;
    content: JSONContent | null;
  };
}

export function QuickNotesCard({ quickNote }: QuickNotesCardProps) {
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(
    (content: JSONContent) => {
      setSaveStatus("saving");

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(async () => {
        try {
          await updateQuickNote(quickNote.id, content);
          setSaveStatus("saved");
          // Reset to idle after a brief "Saved" display
          setTimeout(() => setSaveStatus("idle"), 2000);
        } catch {
          setSaveStatus("idle");
        }
      }, 800);
    },
    [quickNote.id]
  );

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-gold">
            <StickyNote className="h-5 w-5" />
            Quick Notes
          </CardTitle>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {saveStatus === "saving" && (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Saving...</span>
              </>
            )}
            {saveStatus === "saved" && (
              <>
                <Check className="h-3 w-3 text-arcane-teal" />
                <span className="text-arcane-teal">Saved</span>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col">
        <RichTextEditor
          content={quickNote.content}
          onChange={handleChange}
          placeholder="Jot down quick notes, reminders, or ideas..."
          className="flex-1"
        />
      </CardContent>
    </Card>
  );
}
