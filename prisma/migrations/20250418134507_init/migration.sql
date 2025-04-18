/*
  Warnings:

  - The values [iniciando] on the enum `project_status` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `employee_project` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "project_status_new" AS ENUM ('nao_iniciado', 'em_andamento', 'concluido', 'cancelado', 'em_espera');
ALTER TABLE "project" ALTER COLUMN "status" TYPE "project_status_new" USING ("status"::text::"project_status_new");
ALTER TYPE "project_status" RENAME TO "project_status_old";
ALTER TYPE "project_status_new" RENAME TO "project_status";
DROP TYPE "project_status_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "employee_project" DROP CONSTRAINT "employee_project_employee_id_fkey";

-- DropForeignKey
ALTER TABLE "employee_project" DROP CONSTRAINT "employee_project_project_id_fkey";

-- DropTable
DROP TABLE "employee_project";
