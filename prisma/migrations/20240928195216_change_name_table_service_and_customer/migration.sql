/*
  Warnings:

  - You are about to drop the column `name` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Service` table. All the data in the column will be lost.
  - Added the required column `customerName` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceName` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "name",
ADD COLUMN     "customerName" VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "name",
ADD COLUMN     "serviceName" VARCHAR(255) NOT NULL;
