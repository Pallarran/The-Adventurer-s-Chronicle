import { Swords } from "lucide-react";
import { redirect } from "next/navigation";
import { getActiveCampaign } from "@/lib/campaign";
import {
  getCharacterProfile,
  getProgressionRows,
} from "@/lib/actions/character";
import { PageHeaderSetter } from "@/components/layout/page-header-setter";
import { EmptyState } from "@/components/shared/empty-state";
import { CharacterHubClient } from "@/components/character/character-hub-client";
import type { JSONContent } from "@tiptap/react";

// Prisma returns Json fields as JsonValue; these columns always hold Tiptap docs.
const asTiptap = (v: unknown) => v as JSONContent | null;

export const dynamic = "force-dynamic";

export default async function CharacterPage() {
  const campaign = await getActiveCampaign();
  if (!campaign) redirect("/");
  const profile = await getCharacterProfile(campaign.id);

  if (!profile) {
    return (
      <div>
        <PageHeaderSetter
          title="Character"
          description="Your personal character hub."
        />
        <EmptyState
          icon={Swords}
          title="No Character Profile"
          description="No character profile found for this campaign. It should be created automatically when you set up a campaign."
        />
      </div>
    );
  }

  const progressionRows = await getProgressionRows(profile.id);

  const serializedProfile = {
    id: profile.id,
    name: profile.name,
    classInfo: profile.classInfo,
    race: profile.race,
    level: profile.level,
    portrait: profile.portrait,
    summary: profile.summary,
    // RP fields
    personality: asTiptap(profile.personality),
    ideals: asTiptap(profile.ideals),
    bonds: asTiptap(profile.bonds),
    flaws: asTiptap(profile.flaws),
    voiceMannerisms: asTiptap(profile.voiceMannerisms),
    compass: asTiptap(profile.compass),
    contradictions: asTiptap(profile.contradictions),
    pocketPhrases: asTiptap(profile.pocketPhrases),
    reminders: asTiptap(profile.reminders),
    currentGoals: asTiptap(profile.currentGoals),
    fears: asTiptap(profile.fears),
    sections: profile.sections.map((s) => ({
      id: s.id,
      type: s.type as "OVERVIEW" | "BUILD" | "BACKSTORY",
      content: asTiptap(s.content),
    })),
  };

  const serializedRows = progressionRows.map((r) => ({
    id: r.id,
    rowType: r.rowType as "LEVEL" | "DOWNTIME" | "THEME",
    level: r.level,
    label: r.label,
    classLabel: r.classLabel,
    features: r.features,
    spells: r.spells,
    notes: r.notes,
    status: r.status as "DONE" | "CURRENT" | "FUTURE",
    sortOrder: r.sortOrder,
  }));

  return (
    <div>
      <PageHeaderSetter
        title="Character"
        description="Your personal character hub."
      />
      <CharacterHubClient
        profile={serializedProfile}
        progressionRows={serializedRows}
      />
    </div>
  );
}
