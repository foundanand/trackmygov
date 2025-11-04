-- CreateEnum
CREATE TYPE "IssueCategory" AS ENUM ('CORRUPTION', 'POTHOLE', 'WATER', 'ELECTRICITY', 'DOMESTIC_VIOLENCE', 'CRIME', 'SANITATION', 'EDUCATION', 'HEALTHCARE', 'ENVIRONMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "IssueStatus" AS ENUM ('REPORTED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateTable
CREATE TABLE "Issue" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "IssueCategory" NOT NULL,
    "status" "IssueStatus" NOT NULL DEFAULT 'REPORTED',
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "state" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "area" TEXT,
    "pincode" TEXT,
    "imageUrls" TEXT[],
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "upvotes" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Issue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityNote" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "helpful" INTEGER NOT NULL DEFAULT 0,
    "notHelpful" INTEGER NOT NULL DEFAULT 0,
    "rating" TEXT,
    "issueId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunityNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IssueUpvote" (
    "id" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IssueUpvote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Issue_status_idx" ON "Issue"("status");

-- CreateIndex
CREATE INDEX "Issue_category_idx" ON "Issue"("category");

-- CreateIndex
CREATE INDEX "Issue_state_idx" ON "Issue"("state");

-- CreateIndex
CREATE INDEX "Issue_city_idx" ON "Issue"("city");

-- CreateIndex
CREATE INDEX "Issue_createdAt_idx" ON "Issue"("createdAt");

-- CreateIndex
CREATE INDEX "CommunityNote_issueId_idx" ON "CommunityNote"("issueId");

-- CreateIndex
CREATE INDEX "CommunityNote_createdBy_idx" ON "CommunityNote"("createdBy");

-- CreateIndex
CREATE INDEX "IssueUpvote_issueId_idx" ON "IssueUpvote"("issueId");

-- CreateIndex
CREATE UNIQUE INDEX "IssueUpvote_issueId_userId_key" ON "IssueUpvote"("issueId", "userId");

-- AddForeignKey
ALTER TABLE "CommunityNote" ADD CONSTRAINT "CommunityNote_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
