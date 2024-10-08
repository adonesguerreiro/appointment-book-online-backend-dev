-- CreateTable
CREATE TABLE "AvaliableTimeSlot" (
    "id" SERIAL NOT NULL,
    "timeSlot" VARCHAR(5) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "avaliableTimeId" INTEGER NOT NULL,

    CONSTRAINT "AvaliableTimeSlot_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AvaliableTimeSlot" ADD CONSTRAINT "AvaliableTimeSlot_avaliableTimeId_fkey" FOREIGN KEY ("avaliableTimeId") REFERENCES "AvaliableTime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
