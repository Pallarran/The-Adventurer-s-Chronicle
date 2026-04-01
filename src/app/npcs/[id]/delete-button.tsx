"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { deleteNpc, restoreNpc, purgeNpc } from "@/lib/actions/npcs";

const UNDO_TIMEOUT = 5000;

export function NpcDeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    await deleteNpc(id);
    router.push("/npcs");

    let purged = false;
    const purgeTimer = setTimeout(async () => {
      purged = true;
      await purgeNpc(id);
    }, UNDO_TIMEOUT);

    toast("NPC deleted", {
      action: {
        label: "Undo",
        onClick: async () => {
          if (purged) return;
          clearTimeout(purgeTimer);
          await restoreNpc(id);
          router.push(`/npcs/${id}`);
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
        title="Delete NPC"
        description="This NPC will be deleted. You'll have a few seconds to undo."
        onConfirm={handleDelete}
        loading={loading}
      />
    </>
  );
}
