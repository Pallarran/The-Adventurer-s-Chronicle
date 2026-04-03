"use server";

import { prisma } from "@/lib/prisma";
import { getActiveCampaign } from "@/lib/campaign";
import {
  DEFAULT_FORM_OPTIONS,
  type FormOptionCategory,
} from "@/lib/constants/form-options";

/**
 * Get the active option list for a category.
 * Returns the campaign's saved list, or defaults if not customised.
 */
export async function getFormOptions(
  category: FormOptionCategory,
): Promise<string[]> {
  const campaign = await getActiveCampaign();
  if (!campaign) return [...DEFAULT_FORM_OPTIONS[category]];

  const saved = campaign.formOptions as Record<string, string[]> | null;
  if (saved && Array.isArray(saved[category])) {
    return saved[category];
  }

  return [...DEFAULT_FORM_OPTIONS[category]];
}

/**
 * Replace the option list for a category (add/remove operations).
 */
export async function updateFormOptions(
  category: FormOptionCategory,
  options: string[],
): Promise<void> {
  const campaign = await getActiveCampaign();
  if (!campaign) return;

  const existing = (campaign.formOptions as Record<string, string[]>) ?? {};
  const updated = { ...existing, [category]: options };

  await prisma.campaign.update({
    where: { id: campaign.id },
    data: { formOptions: updated },
  });
}
