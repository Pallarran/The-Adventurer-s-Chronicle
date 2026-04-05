import { Swords } from "lucide-react";
import { redirect } from "next/navigation";
import { getActiveCampaign } from "@/lib/campaign";
import { getCharacterProfile } from "@/lib/actions/character";
import { PageHeaderSetter } from "@/components/layout/page-header-setter";
import { EmptyState } from "@/components/shared/empty-state";
import {
  CharacterEditForm,
  CharacterEditFormActions,
} from "@/components/character/character-edit-form";

export const dynamic = "force-dynamic";

export default async function EditCharacterPage() {
  const campaign = await getActiveCampaign();
  if (!campaign) redirect("/");
  const profile = await getCharacterProfile(campaign.id);

  if (!profile) {
    return (
      <div>
        <PageHeaderSetter
          title="Edit Character"
          backHref="/character"
          backLabel="Character"
        />
        <EmptyState
          icon={Swords}
          title="No Character Profile"
          description="No character profile found for this campaign."
        />
      </div>
    );
  }

  const serializedProfile = {
    id: profile.id,
    name: profile.name,
    classInfo: profile.classInfo,
    race: profile.race,
    level: profile.level,
    portrait: profile.portrait,
    summary: profile.summary,
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

  return (
    <div>
      <PageHeaderSetter
        title={`Edit ${profile.name || "Character"}`}
        backHref="/character"
        backLabel="Character"
      />

      <div className="flex items-center gap-2 pb-4">
        <CharacterEditFormActions />
      </div>
      <CharacterEditForm profile={serializedProfile} />
    </div>
  );
}
