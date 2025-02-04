-- DropForeignKey
ALTER TABLE "occurrence" DROP CONSTRAINT "occurrence_employee_id_fkey";

-- AlterTable
ALTER TABLE "occurrence" ALTER COLUMN "employee_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "occurrence" ADD CONSTRAINT "occurrence_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
