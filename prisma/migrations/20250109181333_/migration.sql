/*
  Warnings:

  - Added the required column `address` to the `project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `client` to the `project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expected_end_date` to the `project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `responsible` to the `project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_date` to the `project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `project` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "project" ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "client" TEXT NOT NULL,
ADD COLUMN     "crea_number" TEXT,
ADD COLUMN     "engineer" TEXT,
ADD COLUMN     "estimated_budget" DOUBLE PRECISION,
ADD COLUMN     "expected_end_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "responsible" TEXT NOT NULL,
ADD COLUMN     "start_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL;
