-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "plan_id" INTEGER;

-- CreateTable
CREATE TABLE "plans" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "start_timestamp" TIMESTAMP(3) NOT NULL,
    "end_timestamp" TIMESTAMP(3) NOT NULL,
    "color" VARCHAR(7) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;
