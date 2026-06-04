/*
  Warnings:

  - You are about to drop the column `pendingInvite` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "AvaliableTimeSlot" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Schedule" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" DROP COLUMN "pendingInvite",
ADD COLUMN     "deletedAt" TIMESTAMP(3);
