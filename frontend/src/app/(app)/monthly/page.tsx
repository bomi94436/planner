import { InfoIcon } from 'lucide-react'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui'

import { Calendar } from './_components/calendar'

export default function MonthlyPage() {
  return (
    <main className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">Monthly</h1>
        <Tooltip>
          <TooltipTrigger asChild>
            <InfoIcon className="w-4 h-4 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent>월간 할일을 관리하세요.</TooltipContent>
        </Tooltip>
      </div>
      <Calendar />
    </main>
  )
}
