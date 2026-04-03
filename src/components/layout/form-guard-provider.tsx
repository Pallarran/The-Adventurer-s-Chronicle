"use client";

import { createContext, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface FormGuardContextValue {
  isDirty: boolean;
  setDirty: (dirty: boolean) => void;
  requestNavigation: (href: string) => boolean;
}

export const FormGuardContext = createContext<FormGuardContextValue>({
  isDirty: false,
  setDirty: () => {},
  requestNavigation: () => true,
});

export function FormGuardProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dirtyRef = useRef(false);
  const [isDirty, setIsDirtyState] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const setDirty = useCallback((dirty: boolean) => {
    dirtyRef.current = dirty;
    setIsDirtyState(dirty);
  }, []);

  const requestNavigation = useCallback((href: string): boolean => {
    if (!dirtyRef.current) return true;
    setPendingHref(href);
    return false;
  }, []);

  const handleDiscard = useCallback(() => {
    setDirty(false);
    const href = pendingHref;
    setPendingHref(null);
    if (href) {
      router.push(href);
    }
  }, [pendingHref, router, setDirty]);

  const handleKeepEditing = useCallback(() => {
    setPendingHref(null);
  }, []);

  return (
    <FormGuardContext.Provider value={{ isDirty, setDirty, requestNavigation }}>
      {children}
      <Dialog
        open={pendingHref !== null}
        onOpenChange={(open) => {
          if (!open) handleKeepEditing();
        }}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Unsaved changes</DialogTitle>
            <DialogDescription>
              You have unsaved changes that will be lost if you leave this page.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleKeepEditing}>
              Keep editing
            </Button>
            <Button variant="destructive" onClick={handleDiscard}>
              Discard changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FormGuardContext.Provider>
  );
}
