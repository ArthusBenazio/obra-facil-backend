/*
  Warnings:

  - The values [PENDING,ACCEPTED,DECLINED] on the enum `invitation_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "Period" AS ENUM ('manha', 'tarde', 'noite');

-- CreateEnum
CREATE TYPE "Climate" AS ENUM ('ensolarado', 'nublado', 'chuvoso', 'tempestade');

-- CreateEnum
CREATE TYPE "Condition" AS ENUM ('praticavel', 'impraticavel');

-- AlterEnum
BEGIN;
CREATE TYPE "invitation_status_new" AS ENUM ('pending', 'accepted', 'declined');
ALTER TABLE "invitation" ALTER COLUMN "status" TYPE "invitation_status_new" USING ("status"::text::"invitation_status_new");
ALTER TYPE "invitation_status" RENAME TO "invitation_status_old";
ALTER TYPE "invitation_status_new" RENAME TO "invitation_status";
DROP TYPE "invitation_status_old";
COMMIT;

-- CreateTable
CREATE TABLE "weather" (
    "id" TEXT NOT NULL,
    "period" "Period" NOT NULL,
    "climate" "Climate" NOT NULL,
    "condition" "Condition" NOT NULL,
    "construction_log_id" TEXT NOT NULL,

    CONSTRAINT "weather_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "weather" ADD CONSTRAINT "weather_construction_log_id_fkey" FOREIGN KEY ("construction_log_id") REFERENCES "construction_log"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
