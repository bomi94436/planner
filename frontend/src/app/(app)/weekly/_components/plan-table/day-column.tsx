import dayjs from 'dayjs'

import { cn } from '@/lib/utils'
import { useDateStore } from '@/store'
import { days } from '~/weekly/_constants'

export function DayColumn() {
  const selectedDate = useDateStore((state) => state.selectedDate)

  return (
    <div className="grid grid-cols-7 h-10">
      {days.map((day) => (
        <div
          key={day}
          className="flex items-center justify-center border-b border-r last:border-r-0 border-zinc-200"
        >
          <span
            className={cn('text-sm', {
              'px-2 py-1 rounded-md bg-primary text-white':
                day === dayjs(selectedDate).locale('ko').format('ddd'),
            })}
          >
            {day}
          </span>
        </div>
      ))}
    </div>
  )
}
