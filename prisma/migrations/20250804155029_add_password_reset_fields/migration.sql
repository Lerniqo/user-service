/*
  Warnings:

  - A unique constraint covering the columns `[passwordResetToken]` on the table `admins` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[passwordResetToken]` on the table `students` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[passwordResetToken]` on the table `teachers` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."admins" ADD COLUMN     "passwordResetExpires" TIMESTAMP(3),
ADD COLUMN     "passwordResetToken" TEXT;

-- AlterTable
ALTER TABLE "public"."students" ADD COLUMN     "passwordResetExpires" TIMESTAMP(3),
ADD COLUMN     "passwordResetToken" TEXT;

-- AlterTable
ALTER TABLE "public"."teachers" ADD COLUMN     "passwordResetExpires" TIMESTAMP(3),
ADD COLUMN     "passwordResetToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "admins_passwordResetToken_key" ON "public"."admins"("passwordResetToken");

-- CreateIndex
CREATE UNIQUE INDEX "students_passwordResetToken_key" ON "public"."students"("passwordResetToken");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_passwordResetToken_key" ON "public"."teachers"("passwordResetToken");
