/*
  Warnings:

  - You are about to drop the column `alertName` on the `alerts` table. All the data in the column will be lost.
  - You are about to drop the column `companyName` on the `company` table. All the data in the column will be lost.
  - You are about to drop the column `machineName` on the `machines` table. All the data in the column will be lost.
  - Added the required column `name` to the `alerts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `machines` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "alerts" DROP COLUMN "alertName",
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "company" DROP COLUMN "companyName",
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "machines" DROP COLUMN "machineName",
ADD COLUMN     "name" TEXT NOT NULL;
