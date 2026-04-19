"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportCampaignMarkdown } from "@/lib/actions/export-campaign";
import { toast } from "sonner";

interface CampaignExportButtonProps {
  campaignId: string;
  campaignName: string;
}

export function CampaignExportButton({
  campaignId,
  campaignName,
}: CampaignExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const markdown = await exportCampaignMarkdown(campaignId);
      const blob = new Blob([markdown], {
        type: "text/markdown;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const slug = campaignName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      a.download = `${slug}-campaign-export.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Campaign exported.");
    } catch {
      toast.error("Failed to export campaign.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={exporting}
    >
      <Download className="mr-2 h-4 w-4" />
      {exporting ? "Exporting..." : "Export Campaign .md"}
    </Button>
  );
}
