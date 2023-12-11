/*
  Warnings:

  - You are about to drop the `ChannelYoutubeCredential` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ChannelYoutubeCredential" DROP CONSTRAINT "ChannelYoutubeCredential_channelId_fkey";

-- AlterTable
ALTER TABLE "Channel" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "status" "NexusStatus" NOT NULL DEFAULT 'published';

-- DropTable
DROP TABLE "ChannelYoutubeCredential";

-- CreateTable
CREATE TABLE "ChannelYoutube" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "youtubeId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,

    CONSTRAINT "ChannelYoutube_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChannelYoutube_channelId_key" ON "ChannelYoutube"("channelId");

-- AddForeignKey
ALTER TABLE "ChannelYoutube" ADD CONSTRAINT "ChannelYoutube_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
