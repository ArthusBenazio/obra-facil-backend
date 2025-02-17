/*
  Warnings:

  - You are about to drop the column `tasks` on the `construction_log_employee` table. All the data in the column will be lost.
  - Added the required column `role` to the `construction_log_employee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "construction_log_employee" DROP COLUMN "tasks",
ADD COLUMN     "role" TEXT NOT NULL;
