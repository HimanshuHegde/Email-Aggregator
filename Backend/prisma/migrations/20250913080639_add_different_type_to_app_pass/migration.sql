/*
  Warnings:

  - Changed the type of `AppPass` on the `Account` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Account" DROP COLUMN "AppPass",
ADD COLUMN     "AppPass" JSONB NOT NULL;
