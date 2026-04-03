/**
 * Lightweight seed script for Docker production container.
 * Uses pg directly (no TypeScript, no devDependencies needed).
 *
 * Usage: node prisma/seed-docker.mjs
 */
import pg from "pg";
import crypto from "node:crypto";

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
const genId = () => crypto.randomUUID();

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
  const profileId = genId();
  await client.query(
    `INSERT INTO "CharacterProfile" (id, name, "campaignId", "createdAt", "updatedAt")
     VALUES ($1, 'Your Character', 'default-campaign', NOW(), NOW())`,
    [profileId]
  );
  console.log("Created character profile");

  // Create 3 character sections
  for (const type of ["OVERVIEW", "BUILD", "BACKSTORY"]) {
    await client.query(
      `INSERT INTO "CharacterSection" (id, type, "characterProfileId", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, NOW(), NOW())`,
      [genId(), type, profileId]
    );
  }
  console.log("Created character sections: OVERVIEW, BUILD, BACKSTORY");

  // Create default quick note
  await client.query(
    `INSERT INTO "QuickNote" (id, "campaignId", "createdAt", "updatedAt")
     VALUES ($1, 'default-campaign', NOW(), NOW())`,
    [genId()]
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
