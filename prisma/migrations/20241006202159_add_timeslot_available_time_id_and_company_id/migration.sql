/*
  Warnings:

  - A unique constraint covering the columns `[timeSlot,availableTimeId,companyId]` on the table `AvailableTimeSlot` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `companyId` to the `AvailableTimeSlot` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AvailableTimeSlot" ADD COLUMN     "companyId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "AvailableTimeSlot_timeSlot_availableTimeId_companyId_key" ON "AvailableTimeSlot"("timeSlot", "availableTimeId", "companyId");

-- AddForeignKey
ALTER TABLE "AvailableTimeSlot" ADD CONSTRAINT "AvailableTimeSlot_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
