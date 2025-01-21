/*
  Warnings:

  - Added the required column `status` to the `employee` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `project` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "project_status" AS ENUM ('nao_iniciado', 'iniciando', 'em_andamento', 'concluido', 'cancelado', 'em_espera');

-- CreateEnum
CREATE TYPE "employee_status" AS ENUM ('ativo', 'inativo');

-- AlterTable
ALTER TABLE "employee" ADD COLUMN     "status" "employee_status" NOT NULL;

-- AlterTable
ALTER TABLE "project" 
  DROP COLUMN "status", 
  ADD COLUMN "status" "project_status" NOT NULL DEFAULT 'nao_iniciado';
