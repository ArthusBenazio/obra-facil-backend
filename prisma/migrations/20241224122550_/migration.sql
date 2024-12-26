/*
  Warnings:

  - Changed the type of `subscription_plan` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `role` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('free', 'basic', 'premium');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'team', 'client');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "subscription_plan",
ADD COLUMN     "subscription_plan" "SubscriptionPlan" NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL;
