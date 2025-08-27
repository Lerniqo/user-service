/*
  Warnings:

  - You are about to drop the column `experience_summary` on the `teachers` table. All the data in the column will be lost.
  - Added the required column `birthday` to the `students` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `students` table without a default value. This is not possible if the table is not empty.
  - Made the column `grade_level` on table `students` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `address` to the `teachers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `birthday` to the `teachers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `highest_education_level` to the `teachers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `national_id_passport` to the `teachers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone_number` to the `teachers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `years_of_experience` to the `teachers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."students" ADD COLUMN     "address_city" TEXT,
ADD COLUMN     "birthday" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "gender" TEXT NOT NULL,
ADD COLUMN     "parent_contact" TEXT,
ADD COLUMN     "parent_guardian_name" TEXT,
ADD COLUMN     "relationship" TEXT,
ADD COLUMN     "school" TEXT,
ALTER COLUMN "grade_level" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."teachers" DROP COLUMN "experience_summary",
ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "birthday" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "highest_education_level" TEXT NOT NULL,
ADD COLUMN     "national_id_passport" TEXT NOT NULL,
ADD COLUMN     "phone_number" TEXT NOT NULL,
ADD COLUMN     "short_bio" TEXT,
ADD COLUMN     "years_of_experience" INTEGER NOT NULL;
