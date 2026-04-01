import { Swords } from "lucide-react";
import { getActiveCampaign } from "@/lib/campaign";
import { getCharacterProfile } from "@/lib/actions/character";
import { PageHeaderSetter } from "@/components/layout/page-header-setter";
import { EmptyState } from "@/components/shared/empty-state";
import { CharacterHubClient } from "@/components/character/character-hub-client";

export const dynamic = "force-dynamic";

export default async function CharacterPage() {
  const campaign = await getActiveCampaign();
  const profile = await getCharacterProfile(campaign.id);

  if (!profile) {
    return (
      <div>
        <PageHeaderSetter title="Character" description="Your personal character hub." />
        <EmptyState
          icon={Swords}
          title="No Character Profile"
          description="No character profile found for this campaign. It should be created automatically when you set up a campaign."
        />
      </div>
    );
  }

  // Serialize the profile for the client component
  const serializedProfile = {
    id: profile.id,
    name: profile.name,
    classInfo: profile.classInfo,
    race: profile.race,
    level: profile.level,
    portrait: profile.portrait,
    summary: profile.summary,
    sections: profile.sections.map((s) => ({
      id: s.id,
      type: s.type as "OVERVIEW" | "BUILD" | "BACKSTORY",
      content: s.content,
    })),
  };

  return (
    <div>
      <PageHeaderSetter title="Character" description="Your personal character hub." />
      <CharacterHubClient profile={serializedProfile} />
    </div>
  );
}
