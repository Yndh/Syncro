/*
  Warnings:

  - A unique constraint covering the columns `[linkId]` on the table `ProjectInvitation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `linkId` to the `ProjectInvitation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `ProjectInvitation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProjectInvitation" ADD COLUMN     "linkId" TEXT NOT NULL,
ADD COLUMN     "maxUses" INTEGER,
ADD COLUMN     "userId" TEXT NOT NULL,
ADD COLUMN     "uses" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "accepted" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ProjectInvitation_linkId_key" ON "ProjectInvitation"("linkId");
