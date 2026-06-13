"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { deleteLocation, restoreLocation, purgeLocation } from "@/lib/actions/locations";

const UNDO_TIMEOUT = 5000;

export function LocationDeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    const result = await deleteLocation(id);
    if (!result.ok) {
      toast.error(result.error);
      setLoading(false);
      return;
    }
    router.push("/locations");

    let purged = false;
    const purgeTimer = setTimeout(async () => {
      purged = true;
      await purgeLocation(id);
    }, UNDO_TIMEOUT);

    toast("Location deleted", {
      action: {
        label: "Undo",
        onClick: async () => {
          if (purged) return;
          clearTimeout(purgeTimer);
          const restored = await restoreLocation(id);
          if (!restored.ok) {
            toast.error(restored.error);
            return;
          }
          router.push(`/locations/${id}`);
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
        title="Delete Location"
        description="This location will be deleted. You'll have a few seconds to undo."
        onConfirm={handleDelete}
        loading={loading}
      />
    </>
  );
}
