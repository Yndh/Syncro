/*
  Warnings:

  - You are about to drop the column `accepted` on the `ProjectInvitation` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `ProjectInvitation` table. All the data in the column will be lost.
  - You are about to drop the column `invitedById` on the `ProjectInvitation` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `ProjectInvitation` table. All the data in the column will be lost.
  - Added the required column `createdById` to the `ProjectInvitation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ProjectInvitation" DROP CONSTRAINT "ProjectInvitation_invitedById_fkey";

-- AlterTable
ALTER TABLE "ProjectInvitation" DROP COLUMN "accepted",
DROP COLUMN "email",
DROP COLUMN "invitedById",
DROP COLUMN "userId",
ADD COLUMN     "createdById" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "ProjectInvitation" ADD CONSTRAINT "ProjectInvitation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
