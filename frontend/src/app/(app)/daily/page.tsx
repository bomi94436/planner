'use client'

import { TaskList } from './_components/task-list'
import { TimeTable } from './_components/time-table'

export default function DailyPage() {
  return (
    <div className="flex min-h-0 flex-1 gap-2">
      <TaskList />

      <TimeTable />
    </div>
  )
}
