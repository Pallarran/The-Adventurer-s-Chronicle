-- CreateTable
CREATE TABLE "QuestStatusChange" (
    "id" TEXT NOT NULL,
    "questId" TEXT NOT NULL,
    "fromStatus" "QuestStatus",
    "toStatus" "QuestStatus" NOT NULL,
    "sessionId" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestStatusChange_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuestStatusChange_questId_idx" ON "QuestStatusChange"("questId");

-- CreateIndex
CREATE INDEX "QuestStatusChange_sessionId_idx" ON "QuestStatusChange"("sessionId");

-- AddForeignKey
ALTER TABLE "QuestStatusChange" ADD CONSTRAINT "QuestStatusChange_questId_fkey" FOREIGN KEY ("questId") REFERENCES "Quest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestStatusChange" ADD CONSTRAINT "QuestStatusChange_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;
