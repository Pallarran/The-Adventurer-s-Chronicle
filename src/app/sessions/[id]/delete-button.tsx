"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { deleteSession, restoreSession, purgeSession } from "@/lib/actions/sessions";

const UNDO_TIMEOUT = 5000;

export function SessionDeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    const result = await deleteSession(id);
    if (!result.ok) {
      toast.error(result.error);
      setLoading(false);
      return;
    }
    router.push("/sessions");

    let purged = false;
    const purgeTimer = setTimeout(async () => {
      purged = true;
      await purgeSession(id);
    }, UNDO_TIMEOUT);

    toast("Session deleted", {
      action: {
        label: "Undo",
        onClick: async () => {
          if (purged) return;
          clearTimeout(purgeTimer);
          const restored = await restoreSession(id);
          if (!restored.ok) {
            toast.error(restored.error);
            return;
          }
          router.push(`/sessions/${id}`);
        },
      },
      duration: UNDO_TIMEOUT,
    });
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete Session"
        description="This session will be deleted. You'll have a few seconds to undo."
        onConfirm={handleDelete}
        loading={loading}
      />
    </>
  );
}
