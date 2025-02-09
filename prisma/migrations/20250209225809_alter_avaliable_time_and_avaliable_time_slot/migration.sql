/*
  Warnings:

  - You are about to drop the `AvailableTime` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AvailableTimeSlot` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AvailableTime" DROP CONSTRAINT "AvailableTime_companyId_fkey";

-- DropForeignKey
ALTER TABLE "AvailableTimeSlot" DROP CONSTRAINT "AvailableTimeSlot_availableTimeId_fkey";

-- DropForeignKey
ALTER TABLE "AvailableTimeSlot" DROP CONSTRAINT "AvailableTimeSlot_companyId_fkey";

-- DropTable
DROP TABLE "AvailableTime";

-- DropTable
DROP TABLE "AvailableTimeSlot";

-- CreateTable
CREATE TABLE "AvaliableTime" (
    "id" SERIAL NOT NULL,
    "day" "DayWeek",
    "startTime" VARCHAR(255) NOT NULL,
    "endTime" VARCHAR(255) NOT NULL,
    "interval" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" INTEGER NOT NULL,
    "period" "Period",
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "AvaliableTime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvaliableTimeSlot" (
    "id" SERIAL NOT NULL,
    "timeSlot" VARCHAR(5) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "avaliableTimeId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,

    CONSTRAINT "AvaliableTimeSlot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AvaliableTime_day_period_key" ON "AvaliableTime"("day", "period");

-- CreateIndex
CREATE UNIQUE INDEX "AvaliableTimeSlot_timeSlot_avaliableTimeId_companyId_key" ON "AvaliableTimeSlot"("timeSlot", "avaliableTimeId", "companyId");

-- AddForeignKey
ALTER TABLE "AvaliableTime" ADD CONSTRAINT "AvaliableTime_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvaliableTimeSlot" ADD CONSTRAINT "AvaliableTimeSlot_avaliableTimeId_fkey" FOREIGN KEY ("avaliableTimeId") REFERENCES "AvaliableTime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvaliableTimeSlot" ADD CONSTRAINT "AvaliableTimeSlot_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
