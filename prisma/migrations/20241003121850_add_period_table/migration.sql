/*
  Warnings:

  - Made the column `interval` on table `AvailableTime` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Period" AS ENUM ('MORNING', 'AFTERNOON', 'EVENING');

-- AlterTable
ALTER TABLE "AvailableTime" ADD COLUMN     "period" "Period",
ALTER COLUMN "interval" SET NOT NULL;
