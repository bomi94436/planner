-- CreateTable
CREATE TABLE "executions" (
    "id" SERIAL NOT NULL,
    "start_timestamp" TIMESTAMP(3) NOT NULL,
    "end_timestamp" TIMESTAMP(3) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "color" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanExecution" (
    "planId" INTEGER NOT NULL,
    "executionId" INTEGER NOT NULL,

    CONSTRAINT "PlanExecution_pkey" PRIMARY KEY ("planId","executionId")
);

-- AddForeignKey
ALTER TABLE "PlanExecution" ADD CONSTRAINT "PlanExecution_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanExecution" ADD CONSTRAINT "PlanExecution_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "executions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
