/*
  Warnings:

  - You are about to drop the `TaskAssignment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TaskAssignment" DROP CONSTRAINT "TaskAssignment_assignedToId_fkey";

-- DropForeignKey
ALTER TABLE "TaskAssignment" DROP CONSTRAINT "TaskAssignment_taskId_fkey";

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "userId" TEXT;

-- DropTable
DROP TABLE "TaskAssignment";

-- CreateTable
CREATE TABLE "_TaskAssignments" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_TaskAssignments_AB_unique" ON "_TaskAssignments"("A", "B");

-- CreateIndex
CREATE INDEX "_TaskAssignments_B_index" ON "_TaskAssignments"("B");

-- AddForeignKey
ALTER TABLE "_TaskAssignments" ADD CONSTRAINT "_TaskAssignments_A_fkey" FOREIGN KEY ("A") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TaskAssignments" ADD CONSTRAINT "_TaskAssignments_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
