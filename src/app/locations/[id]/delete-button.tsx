"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { deleteLocation } from "@/lib/actions/locations";

export function LocationDeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    await deleteLocation(id);
    router.push("/locations");
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
        description="This will permanently delete this location and all its relations. This cannot be undone."
        onConfirm={handleDelete}
        loading={loading}
      />
    </>
  );
}
