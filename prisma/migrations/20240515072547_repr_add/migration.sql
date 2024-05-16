/*
  Warnings:

  - You are about to drop the column `userId` on the `company` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[representativeId]` on the table `company` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `representativeId` to the `company` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "company" DROP CONSTRAINT "company_userId_fkey";

-- DropIndex
DROP INDEX "company_userId_key";

-- AlterTable
ALTER TABLE "company" DROP COLUMN "userId",
ADD COLUMN     "representativeId" TEXT NOT NULL,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "reprCompanyId" TEXT,
ADD COLUMN     "workerCompanyId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "company_representativeId_key" ON "company"("representativeId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_workerCompanyId_fkey" FOREIGN KEY ("workerCompanyId") REFERENCES "company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company" ADD CONSTRAINT "company_representativeId_fkey" FOREIGN KEY ("representativeId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
