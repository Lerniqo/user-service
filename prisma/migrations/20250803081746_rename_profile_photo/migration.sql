/*
  Warnings:

  - You are about to drop the column `profilePhoto` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "profilePhoto",
ADD COLUMN     "profileImage" TEXT;
