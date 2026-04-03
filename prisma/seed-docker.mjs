/**
 * Lightweight seed script for Docker production container.
 * Uses pg directly (no TypeScript, no devDependencies needed).
 *
 * Usage: node prisma/seed-docker.mjs
 */
import pg from "pg";

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

async function main() {
  await client.connect();

  // Check if already seeded
  const { rows } = await client.query(
    `SELECT id FROM "Campaign" WHERE id = 'default-campaign'`
  );
  if (rows.length > 0) {
    console.log("Database already seeded — skipping.");
    return;
  }

  console.log("Seeding database...");

  // Create default campaign
  await client.query(
    `INSERT INTO "Campaign" (id, name, description, "createdAt", "updatedAt")
     VALUES ('default-campaign', 'My Campaign', 'Your grand adventure begins here.', NOW(), NOW())`
  );
  console.log("Created default campaign");

  // Create character profile
  const profileResult = await client.query(
    `INSERT INTO "CharacterProfile" (name, "campaignId", "createdAt", "updatedAt")
     VALUES ('Your Character', 'default-campaign', NOW(), NOW())
     RETURNING id`
  );
  const profileId = profileResult.rows[0].id;
  console.log("Created character profile");

  // Create 3 character sections
  for (const type of ["OVERVIEW", "BUILD", "BACKSTORY"]) {
    await client.query(
      `INSERT INTO "CharacterSection" (type, "characterProfileId", "createdAt", "updatedAt")
       VALUES ($1, $2, NOW(), NOW())`,
      [type, profileId]
    );
  }
  console.log("Created character sections: OVERVIEW, BUILD, BACKSTORY");

  // Create default quick note
  await client.query(
    `INSERT INTO "QuickNote" (id, "campaignId", "createdAt", "updatedAt")
     VALUES ('default-quicknote', 'default-campaign', NOW(), NOW())`
  );
  console.log("Created default quick note");

  console.log("Seed completed!");
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(() => client.end());
