-- AlterTable
ALTER TABLE "User" ADD COLUMN     "activeSessionId" TEXT,
ADD COLUMN     "sessionExpiresAt" TIMESTAMP(3);
