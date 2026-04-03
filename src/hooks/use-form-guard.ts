"use client";

import { useEffect, useContext } from "react";
import { FormGuardContext } from "@/components/layout/form-guard-provider";

/**
 * Protects a form from accidental navigation when dirty.
 * - Syncs dirty state to the global FormGuardContext (enables sidebar interception)
 * - Registers `beforeunload` for hard navigations (tab close, URL bar)
 */
export function useFormGuard(isDirty: boolean) {
  const { setDirty } = useContext(FormGuardContext);

  // Sync dirty state to context
  useEffect(() => {
    setDirty(isDirty);
    return () => setDirty(false);
  }, [isDirty, setDirty]);

  // beforeunload for hard navigations
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);
}
