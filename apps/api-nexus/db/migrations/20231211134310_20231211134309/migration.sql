/*
  Warnings:

  - You are about to drop the column `refLink` on the `Resource` table. All the data in the column will be lost.
  - You are about to drop the column `videoId` on the `Resource` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Resource" DROP COLUMN "refLink",
DROP COLUMN "videoId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "status" "NexusStatus" NOT NULL DEFAULT 'published';

-- CreateTable
CREATE TABLE "GoogleDriveResource" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "driveId" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,

    CONSTRAINT "GoogleDriveResource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GoogleDriveResource_resourceId_key" ON "GoogleDriveResource"("resourceId");

-- AddForeignKey
ALTER TABLE "GoogleDriveResource" ADD CONSTRAINT "GoogleDriveResource_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
