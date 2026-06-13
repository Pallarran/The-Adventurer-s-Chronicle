"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { deleteQuest, restoreQuest, purgeQuest } from "@/lib/actions/quests";

const UNDO_TIMEOUT = 5000;

export function QuestDeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    const result = await deleteQuest(id);
    if (!result.ok) {
      toast.error(result.error);
      setLoading(false);
      return;
    }
    router.push("/quests");

    let purged = false;
    const purgeTimer = setTimeout(async () => {
      purged = true;
      await purgeQuest(id);
    }, UNDO_TIMEOUT);

    toast("Quest deleted", {
      action: {
        label: "Undo",
        onClick: async () => {
          if (purged) return;
          clearTimeout(purgeTimer);
          const restored = await restoreQuest(id);
          if (!restored.ok) {
            toast.error(restored.error);
            return;
          }
          router.push(`/quests/${id}`);
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
        title="Delete Quest"
        description="This quest will be deleted. You'll have a few seconds to undo."
        onConfirm={handleDelete}
        loading={loading}
      />
    </>
  );
}
