/*
  Warnings:

  - You are about to alter the column `description` on the `Notes` table. The data in that column could be lost. The data in that column will be cast from `VarChar(300)` to `VarChar(255)`.
  - You are about to alter the column `description` on the `Project` table. The data in that column could be lost. The data in that column will be cast from `VarChar(300)` to `VarChar(255)`.
  - You are about to alter the column `description` on the `Task` table. The data in that column could be lost. The data in that column will be cast from `VarChar(300)` to `VarChar(255)`.

*/
-- AlterTable
ALTER TABLE "Notes" ALTER COLUMN "description" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "description" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "description" SET DATA TYPE VARCHAR(255);
