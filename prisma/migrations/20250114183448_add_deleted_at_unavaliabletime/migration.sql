/*
  Warnings:

  - You are about to drop the `UnavailableTime` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UnavailableTime" DROP CONSTRAINT "UnavailableTime_companyId_fkey";

-- DropTable
DROP TABLE "UnavailableTime";

-- CreateTable
CREATE TABLE "UnavaliableTime" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" VARCHAR(255) NOT NULL,
    "endTime" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "companyId" INTEGER NOT NULL,

    CONSTRAINT "UnavaliableTime_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UnavaliableTime" ADD CONSTRAINT "UnavaliableTime_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
