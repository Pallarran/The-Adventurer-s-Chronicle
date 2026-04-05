-- Convert existing text data to Tiptap JSON before changing column types

UPDATE "CharacterProfile"
SET "personality" = jsonb_build_object(
  'type', 'doc',
  'content', jsonb_build_array(
    jsonb_build_object('type', 'paragraph', 'content',
      jsonb_build_array(jsonb_build_object('type', 'text', 'text', "personality"))
    )
  )
)::text
WHERE "personality" IS NOT NULL;

UPDATE "CharacterProfile"
SET "ideals" = jsonb_build_object(
  'type', 'doc',
  'content', jsonb_build_array(
    jsonb_build_object('type', 'paragraph', 'content',
      jsonb_build_array(jsonb_build_object('type', 'text', 'text', "ideals"))
    )
  )
)::text
WHERE "ideals" IS NOT NULL;

UPDATE "CharacterProfile"
SET "bonds" = jsonb_build_object(
  'type', 'doc',
  'content', jsonb_build_array(
    jsonb_build_object('type', 'paragraph', 'content',
      jsonb_build_array(jsonb_build_object('type', 'text', 'text', "bonds"))
    )
  )
)::text
WHERE "bonds" IS NOT NULL;

UPDATE "CharacterProfile"
SET "flaws" = jsonb_build_object(
  'type', 'doc',
  'content', jsonb_build_array(
    jsonb_build_object('type', 'paragraph', 'content',
      jsonb_build_array(jsonb_build_object('type', 'text', 'text', "flaws"))
    )
  )
)::text
WHERE "flaws" IS NOT NULL;

UPDATE "CharacterProfile"
SET "voiceMannerisms" = jsonb_build_object(
  'type', 'doc',
  'content', jsonb_build_array(
    jsonb_build_object('type', 'paragraph', 'content',
      jsonb_build_array(jsonb_build_object('type', 'text', 'text', "voiceMannerisms"))
    )
  )
)::text
WHERE "voiceMannerisms" IS NOT NULL;

UPDATE "CharacterProfile"
SET "currentGoals" = jsonb_build_object(
  'type', 'doc',
  'content', jsonb_build_array(
    jsonb_build_object('type', 'paragraph', 'content',
      jsonb_build_array(jsonb_build_object('type', 'text', 'text', "currentGoals"))
    )
  )
)::text
WHERE "currentGoals" IS NOT NULL;

UPDATE "CharacterProfile"
SET "fears" = jsonb_build_object(
  'type', 'doc',
  'content', jsonb_build_array(
    jsonb_build_object('type', 'paragraph', 'content',
      jsonb_build_array(jsonb_build_object('type', 'text', 'text', "fears"))
    )
  )
)::text
WHERE "fears" IS NOT NULL;

-- Now alter column types from text to jsonb
ALTER TABLE "CharacterProfile" ALTER COLUMN "personality" TYPE JSONB USING "personality"::jsonb;
ALTER TABLE "CharacterProfile" ALTER COLUMN "ideals" TYPE JSONB USING "ideals"::jsonb;
ALTER TABLE "CharacterProfile" ALTER COLUMN "bonds" TYPE JSONB USING "bonds"::jsonb;
ALTER TABLE "CharacterProfile" ALTER COLUMN "flaws" TYPE JSONB USING "flaws"::jsonb;
ALTER TABLE "CharacterProfile" ALTER COLUMN "voiceMannerisms" TYPE JSONB USING "voiceMannerisms"::jsonb;
ALTER TABLE "CharacterProfile" ALTER COLUMN "currentGoals" TYPE JSONB USING "currentGoals"::jsonb;
ALTER TABLE "CharacterProfile" ALTER COLUMN "fears" TYPE JSONB USING "fears"::jsonb;
