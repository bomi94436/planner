import dayjs from 'dayjs'

import { cn } from '@/lib/utils'
import { useDateStore } from '@/store'

export function DayColumn() {
  const selectedDate = useDateStore((state) => state.selectedDate)
  /** 요일 배열 (일요일 ~ 토요일) */
  const days = Array.from({ length: 7 }, (_, i) => dayjs(selectedDate).locale('ko').day(i))

  return (
    <div className="grid grid-cols-7">
      {days.map((day) => (
        <div
          key={day.format('YYYY-MM-DD')}
          className="flex py-1 items-center justify-center border-b border-r last:border-r-0 border-zinc-200"
        >
          <span
            className={cn('text-sm px-2 py-1.5 font-semibold text-muted-foreground', {
              'rounded-md bg-primary text-white': day.isSame(dayjs(selectedDate), 'day'),
            })}
          >
            {day.format('ddd')} {day.format('D')}
          </span>
        </div>
      ))}
    </div>
  )
}
