import dayjs from 'dayjs'

import { Checkbox, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui'
import { useHandleTaskToggle } from '@/hooks'
import { cn } from '@/lib/utils'
import type { Task } from '@/types/task'

interface DayCellProps {
  date: dayjs.Dayjs
  isCurrentMonth: boolean
  isToday: boolean
  isLastColumn: boolean
  isLastRow: boolean
  tasks: Task[]
}

export function DayCell({
  date,
  isCurrentMonth,
  isToday,
  isLastColumn,
  isLastRow,
  tasks,
}: DayCellProps) {
  const { handleTaskToggle } = useHandleTaskToggle()
  return (
    <div
      className={cn('h-40 border-r border-b border-zinc-200 p-1 flex flex-col gap-1', {
        'border-r-0': isLastColumn,
        'border-b-0': isLastRow,
        'bg-zinc-100': !isCurrentMonth,
      })}
    >
      <span
        className={cn(
          'text-sm inline-flex py-1 px-1.5 items-center justify-center rounded-md text-muted-foreground w-fit',
          {
            'text-zinc-400': !isCurrentMonth,
            'bg-primary text-white font-semibold': isToday,
          }
        )}
      >
        {date.date()}
      </span>

      <div className="flex flex-col gap-0.5 overflow-y-auto">
        {tasks.map((task) => (
          <Tooltip key={task.id}>
            <TooltipTrigger asChild>
              <label className="flex items-center gap-1 cursor-pointer group">
                <Checkbox
                  id={task.id.toString()}
                  checked={task.completed}
                  onCheckedChange={handleTaskToggle(task.id, !task.completed)}
                  className="size-3.5"
                  style={
                    task.category?.color && task.completed
                      ? { backgroundColor: task.category.color, borderColor: task.category.color }
                      : undefined
                  }
                />
                <span
                  className={cn('text-xs truncate', {
                    'line-through text-muted-foreground': task.completed,
                  })}
                >
                  {task.title}
                </span>
              </label>
            </TooltipTrigger>
            <TooltipContent>{task.title}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  )
}
