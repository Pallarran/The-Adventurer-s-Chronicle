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
    personality: profile.personality,
    ideals: profile.ideals,
    bonds: profile.bonds,
    flaws: profile.flaws,
    voiceMannerisms: profile.voiceMannerisms,
    currentGoals: profile.currentGoals,
    fears: profile.fears,
    sections: profile.sections.map((s) => ({
      id: s.id,
      type: s.type as "OVERVIEW" | "BUILD" | "BACKSTORY",
      content: s.content,
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
