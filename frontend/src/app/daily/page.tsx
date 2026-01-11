'use client'

import { Timetable } from './_components/timetable'
import { TodoList } from './_components/todo-list'
import { mockTimeBlocks, mockTodos } from './mock-data'

// 오늘 날짜를 "1월 11일 토요일" 형식으로 반환
function formatDate(date: Date): string {
  return date.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
}

export default function DailyPage() {
  const today = new Date()

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* 오늘 날짜 제목 */}
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{formatDate(today)}</h1>

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
    </div>
  )
}
