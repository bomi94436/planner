/*
  Warnings:

  - You are about to drop the `task_execution` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "task_execution" DROP CONSTRAINT "task_execution_execution_id_fkey";

-- DropForeignKey
ALTER TABLE "task_execution" DROP CONSTRAINT "task_execution_task_id_fkey";

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "execution_id" INTEGER;

-- DropTable
DROP TABLE "task_execution";

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_execution_id_fkey" FOREIGN KEY ("execution_id") REFERENCES "executions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
