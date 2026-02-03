-- Rename Plan to Task (데이터 보존)

-- 1. 기존 외래 키 제약 조건 삭제
ALTER TABLE "PlanExecution" DROP CONSTRAINT "PlanExecution_executionId_fkey";
ALTER TABLE "PlanExecution" DROP CONSTRAINT "PlanExecution_planId_fkey";

-- 2. 기존 기본 키 제약 조건 삭제
ALTER TABLE "PlanExecution" DROP CONSTRAINT "PlanExecution_pkey";
ALTER TABLE "plans" DROP CONSTRAINT "plans_pkey";

-- 3. 테이블명 변경
ALTER TABLE "plans" RENAME TO "tasks";
ALTER TABLE "PlanExecution" RENAME TO "task_execution";

-- 4. 컬럼명 변경
ALTER TABLE "task_execution" RENAME COLUMN "planId" TO "task_id";
ALTER TABLE "task_execution" RENAME COLUMN "executionId" TO "execution_id";
ALTER TABLE "tasks" RENAME COLUMN "isAllDay" TO "is_all_day";

-- 5. 기본 키 제약 조건 재생성
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_pkey" PRIMARY KEY ("id");
ALTER TABLE "task_execution" ADD CONSTRAINT "task_execution_pkey" PRIMARY KEY ("task_id", "execution_id");

-- 6. 외래 키 제약 조건 재생성
ALTER TABLE "task_execution" ADD CONSTRAINT "task_execution_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "task_execution" ADD CONSTRAINT "task_execution_execution_id_fkey" FOREIGN KEY ("execution_id") REFERENCES "executions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
