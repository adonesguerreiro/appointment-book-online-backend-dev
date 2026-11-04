-- DropForeignKey
ALTER TABLE "AvaliableTimeSlot" DROP CONSTRAINT "AvaliableTimeSlot_avaliableTimeId_fkey";

-- DropForeignKey
ALTER TABLE "AvaliableTimeSlot" DROP CONSTRAINT "AvaliableTimeSlot_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Schedule" DROP CONSTRAINT "Schedule_timeSlotId_fkey";

-- AlterTable
ALTER TABLE "Schedule" DROP COLUMN "timeSlotId";

-- DropTable
DROP TABLE "AvaliableTimeSlot";
