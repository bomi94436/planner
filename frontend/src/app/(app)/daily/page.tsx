'use client'

import { ExecutionTable } from './_components/execution-table'
import { TaskList } from './_components/task-list'

export default function DailyPage() {
  return (
    <div className="flex min-h-0 flex-1 gap-2">
      <TaskList />

      <ExecutionTable />
    </div>
  )
}
