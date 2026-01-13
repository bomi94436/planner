'use client'

import { Timetable } from './_components/timetable'
import { TodoList } from './_components/todo-list'
import { mockTimeBlocks, mockTodos } from './mock-data'

export default function DailyPage() {
  return (
    <div className="flex min-h-0 flex-1 gap-4">
      <aside className="flex w-80 shrink-0 flex-col gap-2">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">TO DO LIST</h2>
        <TodoList todos={mockTodos} />
      </aside>
      <main className="flex min-h-0 flex-1 flex-col gap-2">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">TIME TRACKER</h2>
        <Timetable timeBlocks={mockTimeBlocks} />
      </main>
    </div>
  )
}
