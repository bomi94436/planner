'use client'

import { TaskList } from './_components/task-list'
import { TimeTable } from './_components/time-table'

export default function DailyPage() {
  return (
    <main className="flex min-h-0 flex-1 flex-col gap-2">
      <h1 className="text-2xl font-bold">Daily</h1>
      <div className="flex min-h-0 flex-1 gap-2">
        <TaskList />
        <TimeTable />
      </div>
    </main>
  )
}
