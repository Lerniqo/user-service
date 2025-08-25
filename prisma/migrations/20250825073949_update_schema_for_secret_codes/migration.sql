/*
  Warnings:

  - You are about to drop the column `adminId` on the `admins` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `admins` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `admins` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `admins` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `admins` table. All the data in the column will be lost.
  - You are about to drop the column `joiningDate` on the `admins` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `admins` table. All the data in the column will be lost.
  - You are about to drop the column `passwordResetExpires` on the `admins` table. All the data in the column will be lost.
  - You are about to drop the column `passwordResetToken` on the `admins` table. All the data in the column will be lost.
  - You are about to drop the column `profileImage` on the `admins` table. All the data in the column will be lost.
  - You are about to drop the column `refreshToken` on the `admins` table. All the data in the column will be lost.
  - You are about to drop the column `refreshTokenExpires` on the `admins` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `admins` table. All the data in the column will be lost.
  - You are about to drop the column `verificationToken` on the `admins` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `enrollmentDate` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `graduationDate` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `passwordResetExpires` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `passwordResetToken` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `profileImage` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `refreshToken` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `refreshTokenExpires` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `verificationToken` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `yearOfStudy` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `teachers` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `teachers` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `teachers` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `teachers` table. All the data in the column will be lost.
  - You are about to drop the column `joiningDate` on the `teachers` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `teachers` table. All the data in the column will be lost.
  - You are about to drop the column `passwordResetExpires` on the `teachers` table. All the data in the column will be lost.
  - You are about to drop the column `passwordResetToken` on the `teachers` table. All the data in the column will be lost.
  - You are about to drop the column `profileImage` on the `teachers` table. All the data in the column will be lost.
  - You are about to drop the column `refreshToken` on the `teachers` table. All the data in the column will be lost.
  - You are about to drop the column `refreshTokenExpires` on the `teachers` table. All the data in the column will be lost.
  - You are about to drop the column `teacherId` on the `teachers` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `teachers` table. All the data in the column will be lost.
  - You are about to drop the column `verificationToken` on the `teachers` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[admin_id]` on the table `admins` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[verification_code]` on the table `admins` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[password_reset_code]` on the table `admins` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[student_id]` on the table `students` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[verification_code]` on the table `students` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[password_reset_code]` on the table `students` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[teacher_id]` on the table `teachers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[verification_code]` on the table `teachers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[password_reset_code]` on the table `teachers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `admin_id` to the `admins` table without a default value. This is not possible if the table is not empty.
  - Added the required column `first_name` to the `admins` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `admins` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `admins` table without a default value. This is not possible if the table is not empty.
  - Added the required column `first_name` to the `students` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `students` table without a default value. This is not possible if the table is not empty.
  - Added the required column `student_id` to the `students` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `students` table without a default value. This is not possible if the table is not empty.
  - Added the required column `first_name` to the `teachers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `teachers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teacher_id` to the `teachers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `teachers` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."admins_adminId_key";

-- DropIndex
DROP INDEX "public"."admins_passwordResetToken_key";

-- DropIndex
DROP INDEX "public"."admins_refreshToken_key";

-- DropIndex
DROP INDEX "public"."admins_verificationToken_key";

-- DropIndex
DROP INDEX "public"."students_passwordResetToken_key";

-- DropIndex
DROP INDEX "public"."students_refreshToken_key";

-- DropIndex
DROP INDEX "public"."students_studentId_key";

-- DropIndex
DROP INDEX "public"."students_verificationToken_key";

-- DropIndex
DROP INDEX "public"."teachers_passwordResetToken_key";

-- DropIndex
DROP INDEX "public"."teachers_refreshToken_key";

-- DropIndex
DROP INDEX "public"."teachers_teacherId_key";

-- DropIndex
DROP INDEX "public"."teachers_verificationToken_key";

-- AlterTable
ALTER TABLE "public"."admins" DROP COLUMN "adminId",
DROP COLUMN "createdAt",
DROP COLUMN "firstName",
DROP COLUMN "isActive",
DROP COLUMN "isVerified",
DROP COLUMN "joiningDate",
DROP COLUMN "lastName",
DROP COLUMN "passwordResetExpires",
DROP COLUMN "passwordResetToken",
DROP COLUMN "profileImage",
DROP COLUMN "refreshToken",
DROP COLUMN "refreshTokenExpires",
DROP COLUMN "updatedAt",
DROP COLUMN "verificationToken",
ADD COLUMN     "admin_id" TEXT NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "first_name" TEXT NOT NULL,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "joining_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "last_name" TEXT NOT NULL,
ADD COLUMN     "password_reset_code" TEXT,
ADD COLUMN     "password_reset_expires" TIMESTAMP(3),
ADD COLUMN     "profile_image" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "verification_code" TEXT,
ALTER COLUMN "permissions" SET DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "public"."students" DROP COLUMN "createdAt",
DROP COLUMN "enrollmentDate",
DROP COLUMN "firstName",
DROP COLUMN "graduationDate",
DROP COLUMN "isActive",
DROP COLUMN "isVerified",
DROP COLUMN "lastName",
DROP COLUMN "passwordResetExpires",
DROP COLUMN "passwordResetToken",
DROP COLUMN "profileImage",
DROP COLUMN "refreshToken",
DROP COLUMN "refreshTokenExpires",
DROP COLUMN "studentId",
DROP COLUMN "updatedAt",
DROP COLUMN "verificationToken",
DROP COLUMN "yearOfStudy",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "enrollment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "first_name" TEXT NOT NULL,
ADD COLUMN     "graduation_date" TIMESTAMP(3),
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "last_name" TEXT NOT NULL,
ADD COLUMN     "learning_goals" TEXT,
ADD COLUMN     "password_reset_code" TEXT,
ADD COLUMN     "password_reset_expires" TIMESTAMP(3),
ADD COLUMN     "profile_image" TEXT,
ADD COLUMN     "student_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "verification_code" TEXT,
ADD COLUMN     "year_of_study" INTEGER,
ALTER COLUMN "gpa" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."teachers" DROP COLUMN "createdAt",
DROP COLUMN "firstName",
DROP COLUMN "isActive",
DROP COLUMN "isVerified",
DROP COLUMN "joiningDate",
DROP COLUMN "lastName",
DROP COLUMN "passwordResetExpires",
DROP COLUMN "passwordResetToken",
DROP COLUMN "profileImage",
DROP COLUMN "refreshToken",
DROP COLUMN "refreshTokenExpires",
DROP COLUMN "teacherId",
DROP COLUMN "updatedAt",
DROP COLUMN "verificationToken",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "first_name" TEXT NOT NULL,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "joining_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "last_name" TEXT NOT NULL,
ADD COLUMN     "password_reset_code" TEXT,
ADD COLUMN     "password_reset_expires" TIMESTAMP(3),
ADD COLUMN     "profile_image" TEXT,
ADD COLUMN     "teacher_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "verification_code" TEXT;

-- DropEnum
DROP TYPE "public"."Role";

-- CreateIndex
CREATE UNIQUE INDEX "admins_admin_id_key" ON "public"."admins"("admin_id");

-- CreateIndex
CREATE UNIQUE INDEX "admins_verification_code_key" ON "public"."admins"("verification_code");

-- CreateIndex
CREATE UNIQUE INDEX "admins_password_reset_code_key" ON "public"."admins"("password_reset_code");

-- CreateIndex
CREATE UNIQUE INDEX "students_student_id_key" ON "public"."students"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "students_verification_code_key" ON "public"."students"("verification_code");

-- CreateIndex
CREATE UNIQUE INDEX "students_password_reset_code_key" ON "public"."students"("password_reset_code");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_teacher_id_key" ON "public"."teachers"("teacher_id");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_verification_code_key" ON "public"."teachers"("verification_code");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_password_reset_code_key" ON "public"."teachers"("password_reset_code");
