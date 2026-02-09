'use client'
import 'dayjs/locale/ko'

import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { InfoIcon } from 'lucide-react'
import { useCallback, useMemo, useRef, useState } from 'react'

import { Card, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui'
import { cn, minutesToDayjs } from '@/lib/utils'
import { useDateStore } from '@/store'
import type { Plan } from '@/types/plan'
import { getPlans } from '~/weekly/_api/func'
import { days, hours, ROW_HEIGHT } from '~/weekly/_constants'
import { useHoveredTime, useWeeklySelection } from '~/weekly/_hooks'
import { preprocessPlans } from '~/weekly/_utils'

import { DayColumn } from './day-column'
import { HourRow } from './hour-row'
import { PlanBlock } from './plan-block'
import { PlanFormDialog } from './plan-form-dialog'
import { SelectionBlock } from './selection-block'
import { TimeTooltip } from './time-tooltip'

export function PlanTable() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [addTargetPlan, setAddTargetPlan] = useState<Partial<Plan> | null>(null)

  const { selectedDate } = useDateStore()

  const {
    selection,
    normalizedSelection,
    displaySelection,
    isDragging,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleClick,
    clearSelection,
  } = useWeeklySelection(containerRef)

  const {
    hoveredTime,
    displayHoveredTime,
    handleMouseMove,
    handleMouseMoveInPlan,
    handleMouseLeave,
  } = useHoveredTime(containerRef)

  // 주의 시작일 (일요일)과 끝일 (토요일)
  const weekStart = useMemo(() => dayjs(selectedDate).day(0).startOf('day'), [selectedDate])
  const weekEnd = useMemo(() => dayjs(selectedDate).day(6).endOf('day'), [selectedDate])

  const { data: processedPlans } = useQuery({
    queryKey: ['plans', weekStart.toISOString(), weekEnd.toISOString()],
    queryFn: () =>
      getPlans({
        startTimestamp: weekStart.toISOString(),
        endTimestamp: weekEnd.toISOString(),
      }),
    select: (data) => preprocessPlans(data ?? [], weekStart),
  })

  // selection 클릭 → PlanFormDialog 열기
  const handleSelectionClick = useCallback(
    (sel: {
      dayIndex: number
      start: number
      end: number
    }): React.MouseEventHandler<HTMLDivElement> =>
      (e) => {
        e.stopPropagation()
        const baseDate = dayjs(selectedDate).day(sel.dayIndex)
        setAddTargetPlan({
          startTimestamp: minutesToDayjs(sel.start, baseDate.toDate()).toDate(),
          endTimestamp: minutesToDayjs(sel.end, baseDate.toDate()).toDate(),
        })
      },
    [selectedDate]
  )

  return (
    <main className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">계획</h2>
        <Tooltip>
          <TooltipTrigger asChild>
            <InfoIcon className="w-4 h-4 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent>
            <p>
              영역을 드래그하여 계획 블럭을 <b>생성</b>할 수 있습니다.
            </p>
          </TooltipContent>
        </Tooltip>
      </div>

      <Card className="gap-0 py-0 overflow-hidden">
        <div className="grid grid-cols-[auto_1fr] grid-rows-[auto_1fr]">
          <div className="border-r border-b border-zinc-200" />
          <DayColumn />
          <HourRow />

          {/* 그리드 + 블럭 영역 */}
          <div
            ref={containerRef}
            className={cn('relative grid grid-cols-7', {
              'cursor-row-resize select-none': isDragging,
            })}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
          >
            {hours.map((hourIndex) =>
              days.map((day, dayIndex) => (
                <div
                  key={`${hourIndex}-${day}`}
                  className={cn('border-b border-r border-zinc-200', {
                    'border-r-0': dayIndex === days.length - 1,
                  })}
                  style={{ height: ROW_HEIGHT }}
                />
              ))
            )}

            {/* plan 블럭 (그리드 위에 단일 블럭) */}
            {processedPlans?.map(({ plan, startIndex, endIndex, dayIndex }) => (
              <PlanBlock
                key={`${plan.id}-${dayIndex}`}
                plan={plan}
                dayIndex={dayIndex}
                topPx={(startIndex / 60) * ROW_HEIGHT}
                heightPx={((endIndex - startIndex) / 60) * ROW_HEIGHT}
                onMouseMove={handleMouseMoveInPlan(plan)}
              />
            ))}

            {/* selection 영역 (그리드 위에 단일 블럭) */}
            {normalizedSelection && (
              <SelectionBlock
                dayIndex={normalizedSelection.dayIndex}
                topPx={(normalizedSelection.start / 60) * ROW_HEIGHT}
                heightPx={((normalizedSelection.end - normalizedSelection.start) / 60) * ROW_HEIGHT}
                onClick={handleSelectionClick(normalizedSelection)}
              />
            )}
          </div>
        </div>
      </Card>

      <PlanFormDialog
        open={!!addTargetPlan}
        plan={addTargetPlan}
        onOpenChange={(open) => {
          if (!open) {
            setAddTargetPlan(null)
            clearSelection()
          }
        }}
      />

      {/* 드래그 시간 Tooltip */}
      {selection && displaySelection && (
        <TimeTooltip x={selection.tooltipPosition.x} top={selection.tooltipPosition.top}>
          {displaySelection}
        </TimeTooltip>
      )}

      {/* hover 시간 Tooltip */}
      {!selection && hoveredTime && displayHoveredTime && (
        <TimeTooltip x={hoveredTime.tooltipPosition.x} top={hoveredTime.tooltipPosition.top}>
          {displayHoveredTime}
        </TimeTooltip>
      )}
    </main>
  )
}
