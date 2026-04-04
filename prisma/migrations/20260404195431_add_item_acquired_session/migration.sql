-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "acquiredInSessionId" TEXT;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_acquiredInSessionId_fkey" FOREIGN KEY ("acquiredInSessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;
