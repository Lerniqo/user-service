/*
  Warnings:

  - You are about to drop the `admins` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `students` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `teachers` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('Student', 'Teacher', 'Admin');

-- DropTable
DROP TABLE "public"."admins";

-- DropTable
DROP TABLE "public"."students";

-- DropTable
DROP TABLE "public"."teachers";

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL,
    "full_name" TEXT NOT NULL,
    "grade_level" INTEGER,
    "learning_goals" TEXT,
    "qualifications" TEXT,
    "experience_summary" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "profile_image" TEXT,
    "verification_code" TEXT,
    "password_reset_code" TEXT,
    "password_reset_expires" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_verification_code_key" ON "public"."users"("verification_code");

-- CreateIndex
CREATE UNIQUE INDEX "users_password_reset_code_key" ON "public"."users"("password_reset_code");
