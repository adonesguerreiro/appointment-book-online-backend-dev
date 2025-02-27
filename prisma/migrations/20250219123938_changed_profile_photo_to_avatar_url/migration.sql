/*
  Warnings:

  - You are about to drop the column `profilePhoto` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "profilePhoto",
ADD COLUMN     "avatarPublicId" VARCHAR(255),
ADD COLUMN     "avatarUrl" VARCHAR(255);
