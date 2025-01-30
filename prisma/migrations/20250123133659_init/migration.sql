/*
  Warnings:

  - Added the required column `cpf` to the `employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pix_key` to the `employee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "employee" ADD COLUMN     "cpf" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "pix_key" TEXT NOT NULL;
