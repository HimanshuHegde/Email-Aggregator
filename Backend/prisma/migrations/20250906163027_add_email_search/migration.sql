-- CreateTable
CREATE TABLE "Emails" (
    "id" SERIAL NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "folder" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "aiLabel" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "accountId" INTEGER NOT NULL,

    CONSTRAINT "Emails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "AppPass" TEXT NOT NULL,
    "ownerId" INTEGER NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Emails" ADD CONSTRAINT "Emails_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add a generated tsvector column for full-text search
ALTER TABLE "Emails" 
ADD COLUMN "search_vector" tsvector 
GENERATED ALWAYS AS (
  to_tsvector(
    'english', 
    coalesce("subject",'') || ' ' || 
    coalesce("body",'')    || ' ' || 
    coalesce("from",'')    || ' ' || 
    coalesce("to",'')      || ' ' || 
    coalesce("name",'')    || ' ' || 
    coalesce("aiLabel",'')
  )
) STORED;

-- Create a GIN index for fast searching
CREATE INDEX "emails_search_idx" ON "Emails" USING GIN ("search_vector");