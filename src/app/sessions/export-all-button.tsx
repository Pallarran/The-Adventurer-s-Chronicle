"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportAllSessionsMarkdown } from "@/lib/actions/export-sessions";

interface ExportAllSessionsButtonProps {
  campaignId: string;
}

export function ExportAllSessionsButton({
  campaignId,
}: ExportAllSessionsButtonProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const markdown = await exportAllSessionsMarkdown(campaignId);
      const blob = new Blob([markdown], {
        type: "text/markdown;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "campaign-session-notes.md";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={exporting}
    >
      <Download className="mr-2 h-4 w-4" />
      {exporting ? "Exporting..." : "Export All .md"}
    </Button>
  );
}
