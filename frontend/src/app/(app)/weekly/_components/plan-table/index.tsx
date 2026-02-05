'use client'
import 'dayjs/locale/ko'

import { Card } from '@/components/ui'
import { cn } from '@/lib/utils'
import { days, hours, ROW_HEIGHT } from '~/weekly/_constants'

import { DayColumn } from './day-column'
import { HourRow } from './hour-row'

export function PlanTable() {
  return (
    <Card className="gap-0 py-0 overflow-hidden">
      <div className="grid grid-cols-[auto_1fr] grid-rows-[auto_1fr]">
        <div className="border-r border-b border-zinc-200" />
        <DayColumn />
        <HourRow />
        <div className="grid grid-cols-7">
          {hours.map((hour) =>
            days.map((day) => (
              <div
                key={`${hour}-${day}`}
                className={cn('border-b border-r border-zinc-200', {
                  'border-r-0': day === days[days.length - 1],
                })}
                style={{ height: ROW_HEIGHT }}
              />
            ))
          )}
        </div>
      </div>
    </Card>
  )
}
