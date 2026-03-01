-- AlterTable: executions에서 color 컬럼 제거, category_id 추가
ALTER TABLE "executions" DROP COLUMN "color";
ALTER TABLE "executions" ADD COLUMN "category_id" INTEGER;

-- AlterTable: plans에서 color 컬럼 제거, category_id 추가
ALTER TABLE "plans" DROP COLUMN "color";
ALTER TABLE "plans" ADD COLUMN "category_id" INTEGER;

-- AlterTable: tasks에 category_id 추가
ALTER TABLE "tasks" ADD COLUMN "category_id" INTEGER;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "executions" ADD CONSTRAINT "executions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plans" ADD CONSTRAINT "plans_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
