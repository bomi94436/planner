'use client'

import { ExecutionTable } from './_components/execution-table'
import { PlanList } from './_components/plan-list'

export default function DailyPage() {
  return (
    <div className="flex min-h-0 flex-1 gap-2">
      <PlanList />

      <ExecutionTable />
    </div>
  )
}
