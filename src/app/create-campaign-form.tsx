"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createCampaign } from "@/lib/actions/campaigns";

export function CreateCampaignForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    await createCampaign(name, description || undefined);
    router.push("/dashboard");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        name="name"
        placeholder="Campaign name"
        required
        autoFocus
        minLength={1}
        maxLength={100}
      />
      <Input
        name="description"
        placeholder="Short description (optional)"
        maxLength={200}
      />
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating..." : "Begin Your Adventure"}
      </Button>
    </form>
  );
}
