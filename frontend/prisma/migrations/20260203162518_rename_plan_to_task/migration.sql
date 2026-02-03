/*
  Warnings:

  - You are about to drop the `PlanExecution` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `plans` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PlanExecution" DROP CONSTRAINT "PlanExecution_executionId_fkey";

-- DropForeignKey
ALTER TABLE "PlanExecution" DROP CONSTRAINT "PlanExecution_planId_fkey";

-- DropTable
DROP TABLE "PlanExecution";

-- DropTable
DROP TABLE "plans";

-- CreateTable
CREATE TABLE "tasks" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "start_timestamp" TIMESTAMP(3) NOT NULL,
    "end_timestamp" TIMESTAMP(3) NOT NULL,
    "isAllDay" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_execution" (
    "taskId" INTEGER NOT NULL,
    "executionId" INTEGER NOT NULL,

    CONSTRAINT "task_execution_pkey" PRIMARY KEY ("taskId","executionId")
);

-- AddForeignKey
ALTER TABLE "task_execution" ADD CONSTRAINT "task_execution_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_execution" ADD CONSTRAINT "task_execution_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "executions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
