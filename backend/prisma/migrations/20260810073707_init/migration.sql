-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "platform" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "displayName" TEXT,
    "bio" TEXT,
    "followerCount" INTEGER,
    "followingCount" INTEGER,
    "profilePicUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "platform" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "caption" TEXT,
    "mediaType" TEXT NOT NULL,
    "permalink" TEXT,
    "thumbnailUrl" TEXT,
    "publishedAt" DATETIME NOT NULL,
    "collectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isProcessed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "Post_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "mediaUrl" TEXT NOT NULL,
    "mediaType" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "duration" INTEGER,
    "fileSize" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "Media_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MediaFiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mediaId" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "duration" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "MediaFiles_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Analysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "productIdentification" TEXT,
    "brand" TEXT,
    "category" TEXT,
    "campaign" TEXT,
    "targetAudience" TEXT,
    "marketingStrategy" TEXT,
    "primaryMessage" TEXT,
    "hook" TEXT,
    "callToAction" TEXT,
    "visualStyle" TEXT,
    "colorPalette" TEXT,
    "emotion" TEXT,
    "sceneDescriptions" TEXT,
    "objects" TEXT,
    "people" TEXT,
    "speechSummary" TEXT,
    "captionSummary" TEXT,
    "hashtags" TEXT,
    "keywords" TEXT,
    "competitorInsights" TEXT,
    "postingStrategy" TEXT,
    "overallConfidence" REAL,
    "rawMetadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "Analysis_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT,
    "profileId" TEXT,
    "type" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "filePath" TEXT,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "Report_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Report_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ScheduledJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "data" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "result" TEXT,
    "failedReason" TEXT,
    "scheduledAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" DATETIME,
    "finishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "JobHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "data" TEXT,
    "result" TEXT,
    "failedReason" TEXT,
    "duration" INTEGER,
    "startedAt" DATETIME NOT NULL,
    "finishedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "NotificationHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT,
    "postId" TEXT,
    "provider" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "sentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "NotificationHistory_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "NotificationHistory_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SchedulerRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL,
    "finishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PlatformSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "platform" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Provider" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "config" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Log" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "meta" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_platform_platformId_key" ON "Profile"("platform", "platformId");

-- CreateIndex
CREATE UNIQUE INDEX "Post_platform_platformId_key" ON "Post"("platform", "platformId");

-- CreateIndex
CREATE INDEX "Media_postId_idx" ON "Media"("postId");

-- CreateIndex
CREATE INDEX "MediaFiles_mediaId_idx" ON "MediaFiles"("mediaId");

-- CreateIndex
CREATE INDEX "Analysis_postId_idx" ON "Analysis"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "Analysis_postId_key" ON "Analysis"("postId");

-- CreateIndex
CREATE INDEX "Report_postId_idx" ON "Report"("postId");

-- CreateIndex
CREATE INDEX "Report_profileId_idx" ON "Report"("profileId");

-- CreateIndex
CREATE INDEX "NotificationHistory_profileId_idx" ON "NotificationHistory"("profileId");

-- CreateIndex
CREATE INDEX "NotificationHistory_postId_idx" ON "NotificationHistory"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformSettings_platform_key_key" ON "PlatformSettings"("platform", "key");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Log_createdAt_idx" ON "Log"("createdAt");
