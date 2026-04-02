-- CreateEnum
CREATE TYPE "NpcStatus" AS ENUM ('ALIVE', 'DEAD', 'MISSING', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "AlignmentStance" AS ENUM ('ALLIED', 'FRIENDLY', 'NEUTRAL', 'SUSPICIOUS', 'HOSTILE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "CharacterSectionType" AS ENUM ('OVERVIEW', 'BUILD', 'BACKSTORY');

-- CreateEnum
CREATE TYPE "ProgressionRowType" AS ENUM ('LEVEL', 'DOWNTIME', 'THEME');

-- CreateEnum
CREATE TYPE "ProgressionStatus" AS ENUM ('DONE', 'CURRENT', 'FUTURE');

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionNumber" INTEGER NOT NULL,
    "title" TEXT,
    "realDatePlayed" TIMESTAMP(3) NOT NULL,
    "inGameDate" TEXT,
    "notesBody" JSONB,
    "followUpActions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "campaignId" TEXT NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Npc" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "aliasTitle" TEXT,
    "gender" TEXT,
    "classRole" TEXT,
    "race" TEXT,
    "status" "NpcStatus" NOT NULL DEFAULT 'ALIVE',
    "partyMember" BOOLEAN NOT NULL DEFAULT false,
    "notesBody" JSONB,
    "mainImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "campaignId" TEXT NOT NULL,
    "organizationId" TEXT,
    "firstAppearanceSessionId" TEXT,
    "lastAppearanceSessionId" TEXT,

    CONSTRAINT "Npc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "notesBody" JSONB,
    "mainImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "campaignId" TEXT NOT NULL,
    "parentLocationId" TEXT,
    "firstAppearanceSessionId" TEXT,
    "lastAppearanceSessionId" TEXT,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "alignmentStance" "AlignmentStance" NOT NULL DEFAULT 'UNKNOWN',
    "notesBody" JSONB,
    "mainImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "campaignId" TEXT NOT NULL,
    "baseLocationId" TEXT,
    "firstAppearanceSessionId" TEXT,
    "lastAppearanceSessionId" TEXT,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterProfile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "classInfo" TEXT,
    "race" TEXT,
    "level" INTEGER,
    "portrait" TEXT,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "personality" TEXT,
    "ideals" TEXT,
    "bonds" TEXT,
    "flaws" TEXT,
    "voiceMannerisms" TEXT,
    "currentGoals" TEXT,
    "fears" TEXT,
    "campaignId" TEXT NOT NULL,

    CONSTRAINT "CharacterProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterSection" (
    "id" TEXT NOT NULL,
    "type" "CharacterSectionType" NOT NULL,
    "content" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "characterProfileId" TEXT NOT NULL,

    CONSTRAINT "CharacterSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterProgression" (
    "id" TEXT NOT NULL,
    "rowType" "ProgressionRowType" NOT NULL DEFAULT 'LEVEL',
    "level" INTEGER,
    "label" TEXT,
    "classLabel" TEXT,
    "features" TEXT,
    "spells" TEXT,
    "notes" TEXT,
    "status" "ProgressionStatus" NOT NULL DEFAULT 'FUTURE',
    "sortOrder" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "characterProfileId" TEXT NOT NULL,

    CONSTRAINT "CharacterProgression_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ToolLink" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "icon" TEXT,
    "category" TEXT,
    "pinnedToDashboard" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "campaignId" TEXT NOT NULL,

    CONSTRAINT "ToolLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "campaignId" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuickNote" (
    "id" TEXT NOT NULL,
    "content" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "campaignId" TEXT NOT NULL,

    CONSTRAINT "QuickNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionNpc" (
    "sessionId" TEXT NOT NULL,
    "npcId" TEXT NOT NULL,

    CONSTRAINT "SessionNpc_pkey" PRIMARY KEY ("sessionId","npcId")
);

-- CreateTable
CREATE TABLE "SessionLocation" (
    "sessionId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,

    CONSTRAINT "SessionLocation_pkey" PRIMARY KEY ("sessionId","locationId")
);

-- CreateTable
CREATE TABLE "SessionOrganization" (
    "sessionId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "SessionOrganization_pkey" PRIMARY KEY ("sessionId","organizationId")
);

-- CreateTable
CREATE TABLE "OrganizationNpc" (
    "organizationId" TEXT NOT NULL,
    "npcId" TEXT NOT NULL,

    CONSTRAINT "OrganizationNpc_pkey" PRIMARY KEY ("organizationId","npcId")
);

-- CreateTable
CREATE TABLE "LocationOrganization" (
    "locationId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "LocationOrganization_pkey" PRIMARY KEY ("locationId","organizationId")
);

-- CreateTable
CREATE TABLE "NpcTag" (
    "npcId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "NpcTag_pkey" PRIMARY KEY ("npcId","tagId")
);

-- CreateTable
CREATE TABLE "LocationTag" (
    "locationId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "LocationTag_pkey" PRIMARY KEY ("locationId","tagId")
);

-- CreateTable
CREATE TABLE "OrganizationTag" (
    "organizationId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "OrganizationTag_pkey" PRIMARY KEY ("organizationId","tagId")
);

-- CreateTable
CREATE TABLE "SessionTag" (
    "sessionId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "SessionTag_pkey" PRIMARY KEY ("sessionId","tagId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_campaignId_sessionNumber_key" ON "Session"("campaignId", "sessionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterProfile_campaignId_key" ON "CharacterProfile"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterSection_characterProfileId_type_key" ON "CharacterSection"("characterProfileId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterProgression_characterProfileId_level_key" ON "CharacterProgression"("characterProfileId", "level");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_campaignId_name_key" ON "Tag"("campaignId", "name");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Npc" ADD CONSTRAINT "Npc_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Npc" ADD CONSTRAINT "Npc_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Npc" ADD CONSTRAINT "Npc_firstAppearanceSessionId_fkey" FOREIGN KEY ("firstAppearanceSessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Npc" ADD CONSTRAINT "Npc_lastAppearanceSessionId_fkey" FOREIGN KEY ("lastAppearanceSessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_parentLocationId_fkey" FOREIGN KEY ("parentLocationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_firstAppearanceSessionId_fkey" FOREIGN KEY ("firstAppearanceSessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_lastAppearanceSessionId_fkey" FOREIGN KEY ("lastAppearanceSessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_baseLocationId_fkey" FOREIGN KEY ("baseLocationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_firstAppearanceSessionId_fkey" FOREIGN KEY ("firstAppearanceSessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_lastAppearanceSessionId_fkey" FOREIGN KEY ("lastAppearanceSessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterProfile" ADD CONSTRAINT "CharacterProfile_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterSection" ADD CONSTRAINT "CharacterSection_characterProfileId_fkey" FOREIGN KEY ("characterProfileId") REFERENCES "CharacterProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterProgression" ADD CONSTRAINT "CharacterProgression_characterProfileId_fkey" FOREIGN KEY ("characterProfileId") REFERENCES "CharacterProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToolLink" ADD CONSTRAINT "ToolLink_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuickNote" ADD CONSTRAINT "QuickNote_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionNpc" ADD CONSTRAINT "SessionNpc_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionNpc" ADD CONSTRAINT "SessionNpc_npcId_fkey" FOREIGN KEY ("npcId") REFERENCES "Npc"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionLocation" ADD CONSTRAINT "SessionLocation_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionLocation" ADD CONSTRAINT "SessionLocation_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionOrganization" ADD CONSTRAINT "SessionOrganization_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionOrganization" ADD CONSTRAINT "SessionOrganization_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationNpc" ADD CONSTRAINT "OrganizationNpc_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationNpc" ADD CONSTRAINT "OrganizationNpc_npcId_fkey" FOREIGN KEY ("npcId") REFERENCES "Npc"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationOrganization" ADD CONSTRAINT "LocationOrganization_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationOrganization" ADD CONSTRAINT "LocationOrganization_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NpcTag" ADD CONSTRAINT "NpcTag_npcId_fkey" FOREIGN KEY ("npcId") REFERENCES "Npc"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NpcTag" ADD CONSTRAINT "NpcTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationTag" ADD CONSTRAINT "LocationTag_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationTag" ADD CONSTRAINT "LocationTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationTag" ADD CONSTRAINT "OrganizationTag_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationTag" ADD CONSTRAINT "OrganizationTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionTag" ADD CONSTRAINT "SessionTag_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionTag" ADD CONSTRAINT "SessionTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
