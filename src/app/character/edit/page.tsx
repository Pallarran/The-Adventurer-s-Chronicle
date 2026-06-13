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
import type { JSONContent } from "@tiptap/react";

// Prisma returns Json fields as JsonValue; these columns always hold Tiptap docs.
const asTiptap = (v: unknown) => v as JSONContent | null;

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
