/*
  Warnings:

  - You are about to drop the column `project_id` on the `employee` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "employee" DROP CONSTRAINT "employee_project_id_fkey";

-- AlterTable
ALTER TABLE "employee" DROP COLUMN "project_id";
