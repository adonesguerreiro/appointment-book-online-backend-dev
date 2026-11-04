-- DropIndex
DROP INDEX "AvaliableTime_day_period_key";

-- CreateIndex
CREATE UNIQUE INDEX "AvaliableTime_day_period_companyId_key" ON "AvaliableTime"("day", "period", "companyId");
