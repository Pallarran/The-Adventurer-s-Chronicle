import Image from "next/image";
import { ScrollText, Users, MapPin, Swords } from "lucide-react";
import { getActiveCampaign } from "@/lib/campaign";
import { getCampaigns } from "@/lib/actions/campaigns";
import { CampaignList } from "./campaign-list";

export const dynamic = "force-dynamic";

const features = [
  {
    icon: ScrollText,
    title: "Session Logs",
    description: "Record every session with rich text, linked NPCs, locations, and quest progress.",
  },
  {
    icon: Users,
    title: "NPCs & Organizations",
    description: "Track allies, villains, factions, and their relationships across your campaign.",
  },
  {
    icon: MapPin,
    title: "Locations & Items",
    description: "Map your world with detailed locations, magical items, and loot.",
  },
  {
    icon: Swords,
    title: "Character Hub",
    description: "Your character's profile, backstory, build, and level progression in one place.",
  },
];

export default async function WelcomePage() {
  const [activeCampaign, campaigns] = await Promise.all([
    getActiveCampaign(),
    getCampaigns(),
  ]);

  return (
    <div className="flex flex-col items-center px-4 pt-4 pb-12 md:pt-6 md:pb-20 max-w-5xl mx-auto">
      {/* Logo */}
      <Image
        src="/logo-full.png"
        alt="The Adventurer's Chronicle"
        width={500}
        height={342}
        className="-mb-16"
        priority
        unoptimized
      />
      <p className="text-muted-foreground text-center mb-12">
        Your personal companion for tabletop RPG campaigns.<br />
        Track sessions, NPCs, locations, quests, and your character — all in one place.
      </p>

      {/* Campaigns Section */}
      <div className="w-full mb-12">
        <h2 className="text-lg font-semibold text-foreground mb-3">
          {campaigns.length > 0 ? "Your Campaigns" : "Get Started"}
        </h2>
        <CampaignList
          campaigns={campaigns}
          activeCampaignId={activeCampaign?.id ?? null}
        />
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-lg border border-border bg-card p-4 flex gap-3"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gold/10 ring-1 ring-gold/20">
              <feature.icon className="h-4 w-4 text-gold" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">{feature.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
