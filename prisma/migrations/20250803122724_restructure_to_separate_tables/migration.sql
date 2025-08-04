/*
  Warnings:

  - You are about to drop the column `userId` on the `admins` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `teachers` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email]` on the table `admins` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[verificationToken]` on the table `admins` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `students` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[verificationToken]` on the table `students` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `teachers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[verificationToken]` on the table `teachers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `admins` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `admins` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `admins` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `admins` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `students` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `students` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `students` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `students` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `teachers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `teachers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `teachers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `teachers` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."admins" DROP CONSTRAINT "admins_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."students" DROP CONSTRAINT "students_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."teachers" DROP CONSTRAINT "teachers_userId_fkey";

-- DropIndex
DROP INDEX "public"."admins_userId_key";

-- DropIndex
DROP INDEX "public"."students_userId_key";

-- DropIndex
DROP INDEX "public"."teachers_userId_key";

-- AlterTable
ALTER TABLE "public"."admins" DROP COLUMN "userId",
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "profileImage" TEXT,
ADD COLUMN     "verificationToken" TEXT;

-- AlterTable
ALTER TABLE "public"."students" DROP COLUMN "userId",
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "profileImage" TEXT,
ADD COLUMN     "verificationToken" TEXT;

-- AlterTable
ALTER TABLE "public"."teachers" DROP COLUMN "userId",
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "profileImage" TEXT,
ADD COLUMN     "verificationToken" TEXT;

-- DropTable
DROP TABLE "public"."User";

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "public"."admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admins_verificationToken_key" ON "public"."admins"("verificationToken");

-- CreateIndex
CREATE UNIQUE INDEX "students_email_key" ON "public"."students"("email");

-- CreateIndex
CREATE UNIQUE INDEX "students_verificationToken_key" ON "public"."students"("verificationToken");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_email_key" ON "public"."teachers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_verificationToken_key" ON "public"."teachers"("verificationToken");
