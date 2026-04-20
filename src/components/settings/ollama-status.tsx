"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { checkOllamaStatus } from "@/lib/actions/ai";

interface OllamaInfo {
  connected: boolean;
  url: string;
  model: string;
  modelAvailable: boolean;
}

export function OllamaStatus() {
  const [status, setStatus] = useState<OllamaInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkOllamaStatus()
      .then(setStatus)
      .catch(() =>
        setStatus({ connected: false, url: "", model: "", modelAvailable: false })
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Checking Ollama connection...
      </div>
    );
  }

  if (!status || !status.connected) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          <span className="text-muted-foreground">Disconnected</span>
        </div>
        <p className="text-xs text-muted-foreground/60">
          Install Ollama on your server and make sure it&apos;s running.
          The app will look for it at <code className="text-muted-foreground">{status?.url || "http://localhost:11434"}</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        <span className="text-foreground">Connected</span>
      </div>
      <div className="flex flex-col gap-1 text-xs text-muted-foreground">
        <span>
          Model: <code className="text-foreground">{status.model}</code>
          {status.modelAvailable ? (
            <span className="ml-1.5 text-emerald-500">(available)</span>
          ) : (
            <span className="ml-1.5 text-amber-500">
              (not pulled — run <code>ollama pull {status.model}</code>)
            </span>
          )}
        </span>
        <span>
          URL: <code className="text-muted-foreground">{status.url}</code>
        </span>
      </div>
    </div>
  );
}
