import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create default campaign
  const campaign = await prisma.campaign.upsert({
    where: { id: "default-campaign" },
    update: {},
    create: {
      id: "default-campaign",
      name: "My Campaign",
      description: "Your grand adventure begins here.",
    },
  });

  console.log(`Campaign created: ${campaign.name}`);

  // Create character profile with 3 sections
  const profile = await prisma.characterProfile.upsert({
    where: { campaignId: campaign.id },
    update: {},
    create: {
      name: "Your Character",
      campaignId: campaign.id,
    },
  });

  console.log(`Character profile created: ${profile.name}`);

  // Create the 3 character sections
  const sectionTypes = ["OVERVIEW", "BUILD", "BACKSTORY"] as const;
  for (const type of sectionTypes) {
    await prisma.characterSection.upsert({
      where: {
        characterProfileId_type: {
          characterProfileId: profile.id,
          type,
        },
      },
      update: {},
      create: {
        type,
        characterProfileId: profile.id,
      },
    });
  }

  console.log("Character sections created: OVERVIEW, BUILD, BACKSTORY");

  // Create default quick note
  await prisma.quickNote.upsert({
    where: { id: "default-quicknote" },
    update: {},
    create: {
      id: "default-quicknote",
      campaignId: campaign.id,
    },
  });

  console.log("Quick note created");
  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
