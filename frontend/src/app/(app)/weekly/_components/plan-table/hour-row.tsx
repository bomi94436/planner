import { hours } from '@/constants'
import { formatHour } from '~/daily/_utils'
import { ROW_HEIGHT } from '~/weekly/_constants'

export function HourRow() {
  return (
    <div className="grid grid-cols-1">
      {hours.map((hourIndex) => (
        <div
          key={hourIndex}
          className="flex w-10 items-center justify-center border-b border-r border-zinc-200 text-sm"
          style={{ height: ROW_HEIGHT }}
        >
          {formatHour(hourIndex)}
        </div>
      ))}
    </div>
  )
}
