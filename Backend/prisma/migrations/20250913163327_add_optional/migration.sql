-- DropForeignKey
ALTER TABLE "Emails" DROP CONSTRAINT "Emails_accountId_fkey";

-- AlterTable
ALTER TABLE "Emails" ALTER COLUMN "accountId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Emails" ADD CONSTRAINT "Emails_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
