-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('person', 'business');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "cnpj" VARCHAR(18),
ADD COLUMN     "company_name" VARCHAR(100),
ADD COLUMN     "cpf" VARCHAR(14),
ADD COLUMN     "phone" VARCHAR(15) NOT NULL DEFAULT 'N/A',
ADD COLUMN     "position_company" VARCHAR(50),
ADD COLUMN     "user_type" "UserType" NOT NULL DEFAULT 'person';
