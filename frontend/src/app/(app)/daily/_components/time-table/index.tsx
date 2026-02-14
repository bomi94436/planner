'use client'

import { InfoIcon } from 'lucide-react'

import { Card, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui'
import { hours } from '@/constants'
import { formatHour } from '~/daily/_utils'

import { ExecutionTable } from './execution-table'
import { PlanTable } from './plan-table'

export function TimeTable() {
  return (
    <main className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">실행</h2>
        {/* 정보 tooltip */}
        <Tooltip>
          <TooltipTrigger asChild>
            <InfoIcon className="w-4 h-4 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent>
            <p>
              영역을 드래그하여 실행 블럭을 <b>생성</b>할 수 있습니다.
            </p>
            <p>
              실행 블럭을 클릭하여 <b>수정</b> 또는 <b>삭제</b>할 수 있습니다.
            </p>
          </TooltipContent>
        </Tooltip>
      </div>

      <Card className="gap-0 py-0 rounded">
        <div className="flex">
          <PlanTable />
          <div className="w-10 shrink-0">
            {hours.map((hourIndex) => (
              <div
                key={hourIndex}
                className="flex h-8 items-center justify-center border-b border-x border-zinc-200 px-2 text-sm text-muted-foreground last:border-b-0"
              >
                {formatHour(hourIndex)}
              </div>
            ))}
          </div>
          <ExecutionTable />
        </div>
      </Card>
    </main>
  )
}
