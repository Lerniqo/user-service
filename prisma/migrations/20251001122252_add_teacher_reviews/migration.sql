-- CreateTable
CREATE TABLE "public"."teacher_reviews" (
    "id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "is_anonymous" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "teacher_reviews_teacher_id_student_id_key" ON "public"."teacher_reviews"("teacher_id", "student_id");

-- AddForeignKey
ALTER TABLE "public"."teacher_reviews" ADD CONSTRAINT "teacher_reviews_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."teacher_reviews" ADD CONSTRAINT "teacher_reviews_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
