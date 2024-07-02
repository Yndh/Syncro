/*
  Warnings:

  - Made the column `createdById` on table `Notes` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Notes" DROP CONSTRAINT "Notes_createdById_fkey";

-- AlterTable
ALTER TABLE "Notes" ALTER COLUMN "createdById" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Notes" ADD CONSTRAINT "Notes_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
