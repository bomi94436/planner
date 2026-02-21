'use client'

import 'dayjs/locale/ko'

import dayjs from 'dayjs'

import { Card } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useDateStore } from '@/store'

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

export function Calendar() {
  const selectedDate = useDateStore((state) => state.selectedDate)
  const current = dayjs(selectedDate)

  // 해당 월의 1일이 속한 주의 일요일부터 마지막 날이 속한 주의 토요일까지
  const calendarStart = current.startOf('month').day(0) // 1일이 속한 주의 일요일
  const calendarEnd = current.endOf('month').day(6) // 마지막 날이 속한 주의 토요일

  // 달력 날짜 배열 생성
  const totalDays = calendarEnd.diff(calendarStart, 'day') + 1
  const dates = Array.from({ length: totalDays }, (_, i) => calendarStart.add(i, 'day'))
  const totalRows = totalDays / 7

  return (
    <Card className="gap-0 py-0 overflow-hidden">
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7">
        {DAY_LABELS.map((label) => (
          <div
            key={label}
            className="flex items-center justify-center border-b border-r last:border-r-0 border-zinc-200 py-2"
          >
            <span className="text-sm font-semibold text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      {/* 날짜 셀 */}
      <div className="grid grid-cols-7">
        {dates.map((date, index) => {
          const isCurrentMonth = date.month() === current.month()
          const isToday = date.isSame(current, 'day')
          const dayIndex = index % 7
          const rowIndex = Math.floor(index / 7)

          return (
            <div
              key={date.format('YYYY-MM-DD')}
              className={cn('h-40 border-r border-b border-zinc-200 p-1', {
                'border-r-0': dayIndex === 6,
                'border-b-0': rowIndex === totalRows - 1,
                'bg-zinc-100': !isCurrentMonth,
              })}
            >
              <span
                className={cn(
                  'text-sm inline-flex py-1 px-1.5 items-center justify-center rounded-md text-muted-foreground',
                  {
                    'text-zinc-400': !isCurrentMonth,
                    'bg-primary text-white font-semibold': isToday,
                  }
                )}
              >
                {date.date()}
              </span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
