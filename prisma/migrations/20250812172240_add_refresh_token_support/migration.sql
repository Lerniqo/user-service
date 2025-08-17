/*
  Warnings:

  - A unique constraint covering the columns `[refreshToken]` on the table `admins` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[refreshToken]` on the table `students` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[refreshToken]` on the table `teachers` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."admins" ADD COLUMN     "refreshToken" TEXT,
ADD COLUMN     "refreshTokenExpires" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."students" ADD COLUMN     "refreshToken" TEXT,
ADD COLUMN     "refreshTokenExpires" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."teachers" ADD COLUMN     "refreshToken" TEXT,
ADD COLUMN     "refreshTokenExpires" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "admins_refreshToken_key" ON "public"."admins"("refreshToken");

-- CreateIndex
CREATE UNIQUE INDEX "students_refreshToken_key" ON "public"."students"("refreshToken");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_refreshToken_key" ON "public"."teachers"("refreshToken");
