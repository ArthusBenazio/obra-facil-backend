/*
  Warnings:

  - The values [ensolarado,tempestade] on the enum `Climate` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Climate_new" AS ENUM ('ceu_limpo', 'nublado', 'chuvoso');
ALTER TABLE "weather" ALTER COLUMN "climate" TYPE "Climate_new" USING ("climate"::text::"Climate_new");
ALTER TYPE "Climate" RENAME TO "Climate_old";
ALTER TYPE "Climate_new" RENAME TO "Climate";
DROP TYPE "Climate_old";
COMMIT;
