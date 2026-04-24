-- AlterTable
ALTER TABLE "User" ADD COLUMN     "passwordResetExpires" TIMESTAMP(3),
ADD COLUMN     "passwordResetToken" VARCHAR(255),
ADD COLUMN     "pendingInvite" BOOLEAN DEFAULT false,
ALTER COLUMN "password" DROP NOT NULL;
