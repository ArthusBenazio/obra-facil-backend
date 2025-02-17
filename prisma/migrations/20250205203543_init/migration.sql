/*
  Warnings:

  - You are about to drop the column `created_by_user_id` on the `project` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `project` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "project" DROP CONSTRAINT "project_created_by_user_id_fkey";

-- AlterTable
ALTER TABLE "project" DROP COLUMN "created_by_user_id",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
