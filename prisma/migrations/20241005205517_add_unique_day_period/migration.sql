/*
  Warnings:

  - A unique constraint covering the columns `[day,period]` on the table `AvailableTime` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AvailableTime_day_period_key" ON "AvailableTime"("day", "period");
