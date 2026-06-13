-- AlterTable
ALTER TABLE "Npc" ADD COLUMN "currentLocationId" TEXT;

-- AlterTable
ALTER TABLE "Quest" ADD COLUMN "questGiverNpcId" TEXT;

-- AddForeignKey
ALTER TABLE "Npc" ADD CONSTRAINT "Npc_currentLocationId_fkey" FOREIGN KEY ("currentLocationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quest" ADD CONSTRAINT "Quest_questGiverNpcId_fkey" FOREIGN KEY ("questGiverNpcId") REFERENCES "Npc"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "Session_campaignId_deletedAt_idx" ON "Session"("campaignId", "deletedAt");

-- CreateIndex
CREATE INDEX "Npc_campaignId_deletedAt_idx" ON "Npc"("campaignId", "deletedAt");

-- CreateIndex
CREATE INDEX "Location_campaignId_deletedAt_idx" ON "Location"("campaignId", "deletedAt");

-- CreateIndex
CREATE INDEX "Organization_campaignId_deletedAt_idx" ON "Organization"("campaignId", "deletedAt");

-- CreateIndex
CREATE INDEX "Item_campaignId_deletedAt_idx" ON "Item"("campaignId", "deletedAt");

-- CreateIndex
CREATE INDEX "Quest_campaignId_deletedAt_idx" ON "Quest"("campaignId", "deletedAt");
