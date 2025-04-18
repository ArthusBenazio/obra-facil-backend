/*
  Warnings:

  - Made the column `company_id` on table `project` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "project" DROP CONSTRAINT "project_company_id_fkey";

-- AlterTable
ALTER TABLE "project" ALTER COLUMN "company_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
