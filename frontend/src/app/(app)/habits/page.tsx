import { InfoIcon, PlusIcon } from 'lucide-react'

import { Button, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui'

import { HabitFormDialog } from './_components/habit-form-dialog'
import { HabitList } from './_components/habit-list'

export default function HabitsPage() {
  return (
    <main className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="flex items-center gap-2 pb-2">
        <h1 className="text-2xl font-bold">Habit Tracker</h1>
        <Tooltip>
          <TooltipTrigger asChild>
            <InfoIcon className="w-4 h-4 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent>
            습관을 관리하세요.
            <br />
            현재일의 습관만 체크할 수 있습니다.
          </TooltipContent>
        </Tooltip>
        <HabitFormDialog mode="add">
          <Button variant="outline" size="sm" className="ml-auto gap-1">
            <PlusIcon className="w-4 h-4" />
            추가
          </Button>
        </HabitFormDialog>
      </div>

      <HabitList />
    </main>
  )
}
