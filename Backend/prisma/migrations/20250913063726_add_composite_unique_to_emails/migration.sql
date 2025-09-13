/*
  Warnings:

  - You are about to drop the column `search_vector` on the `Emails` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[accountId,from,to,subject,date,body]` on the table `Emails` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "emails_search_idx";

-- AlterTable
ALTER TABLE "Emails" DROP COLUMN "search_vector";

-- CreateIndex
CREATE UNIQUE INDEX "Emails_accountId_from_to_subject_date_body_key" ON "Emails"("accountId", "from", "to", "subject", "date", "body");
