import { redirect } from "next/navigation";
import Image from "next/image";
import { ScrollText, Users, MapPin, Swords } from "lucide-react";
import { getActiveCampaign } from "@/lib/campaign";
import { CreateCampaignForm } from "./create-campaign-form";

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
  const campaign = await getActiveCampaign();
  if (campaign) redirect("/dashboard");

  return (
    <div className="flex flex-col items-center px-4 py-12 md:py-20">
      {/* Logo + Tagline */}
      <Image
        src="/logo-full.png"
        alt="The Adventurer's Chronicle"
        width={400}
        height={200}
        className="mb-6"
        priority
      />
      <p className="text-muted-foreground text-center max-w-md mb-12">
        Your personal companion for tabletop RPG campaigns.
        Track sessions, NPCs, locations, quests, and your character — all in one place.
      </p>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full mb-12">
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

      {/* Create Campaign */}
      <div className="w-full max-w-md rounded-lg border border-gold/20 bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Create Your First Campaign
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Give your campaign a name to get started.
        </p>
        <CreateCampaignForm />
      </div>
    </div>
  );
}
