/*
  Warnings:

  - Added the required column `customerName` to the `Schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerPhone` to the `Schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration` to the `Schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceName` to the `Schedule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Schedule" ADD COLUMN     "customerName" TEXT NOT NULL,
ADD COLUMN     "customerPhone" TEXT NOT NULL,
ADD COLUMN     "duration" VARCHAR(255) NOT NULL,
ADD COLUMN     "price" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "serviceName" VARCHAR(255) NOT NULL;
