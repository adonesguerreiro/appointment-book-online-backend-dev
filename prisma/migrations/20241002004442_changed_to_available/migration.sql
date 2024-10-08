/*
  Warnings:

  - You are about to drop the `AvaliableTime` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AvaliableTimeSlot` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AvaliableTime" DROP CONSTRAINT "AvaliableTime_companyId_fkey";

-- DropForeignKey
ALTER TABLE "AvaliableTimeSlot" DROP CONSTRAINT "AvaliableTimeSlot_avaliableTimeId_fkey";

-- DropTable
DROP TABLE "AvaliableTime";

-- DropTable
DROP TABLE "AvaliableTimeSlot";

-- CreateTable
CREATE TABLE "AvailableTime" (
    "id" SERIAL NOT NULL,
    "day" "DayWeek",
    "startTime" VARCHAR(255) NOT NULL,
    "endTime" VARCHAR(255) NOT NULL,
    "interval" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" INTEGER NOT NULL,

    CONSTRAINT "AvailableTime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvailableTimeSlot" (
    "id" SERIAL NOT NULL,
    "timeSlot" VARCHAR(5) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "availableTimeId" INTEGER NOT NULL,

    CONSTRAINT "AvailableTimeSlot_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AvailableTime" ADD CONSTRAINT "AvailableTime_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailableTimeSlot" ADD CONSTRAINT "AvailableTimeSlot_availableTimeId_fkey" FOREIGN KEY ("availableTimeId") REFERENCES "AvailableTime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
