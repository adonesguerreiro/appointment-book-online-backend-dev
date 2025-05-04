/*
  Warnings:

  - A unique constraint covering the columns `[slugCompany]` on the table `Company` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "slugCompany" VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX "Company_slugCompany_key" ON "Company"("slugCompany");
