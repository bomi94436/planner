'use client'
import 'dayjs/locale/ko'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { InfoIcon } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Card,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui'
import { hours } from '@/constants'
import { cn, minutesToDayjs } from '@/lib/utils'
import { selectWeekRange, useDateStore } from '@/store'
import type { Plan } from '@/types/plan'
import { deletePlan, getPlans } from '~/weekly/_api/func'
import { days, ROW_HEIGHT } from '~/weekly/_constants'
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
  const [editTargetPlan, setEditTargetPlan] = useState<Plan | null>(null)
  const [deleteTargetPlanId, setDeleteTargetPlanId] = useState<number | null>(null)
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false)

  // 주의 시작 (일요일 START_HOUR)과 끝 (다음 일요일 START_HOUR)
  const { selectedDate, weekStartISO, weekEndISO } = useDateStore(useShallow(selectWeekRange))

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

  const { data: processedPlans } = useQuery({
    queryKey: ['plans', weekStartISO, weekEndISO],
    queryFn: () =>
      getPlans({
        startTimestamp: weekStartISO,
        endTimestamp: weekEndISO,
      }),
    select: (data) => preprocessPlans(data ?? [], weekStartISO),
  })

  const queryClient = useQueryClient()

  const { mutate: deletePlanMutation } = useMutation({
    mutationFn: (id: number) => deletePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] })
      setDeleteTargetPlanId(null)
    },
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

  const handleEditPlanClick = useCallback(
    (plan: Plan) => () => {
      setEditTargetPlan(plan)
    },
    []
  )

  const handleDeletePlanClick = useCallback(
    (id: number) => () => {
      setDeleteTargetPlanId(id)
    },
    []
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
            <p>
              계획 블럭을 클릭하여 <b>수정</b> 또는 <b>삭제</b>할 수 있습니다.
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
            {/* 셀 */}
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
                onContextMenuChange={setIsContextMenuOpen}
                handleEditClick={handleEditPlanClick(plan)}
                handleDeleteClick={handleDeletePlanClick(plan.id)}
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
        mode="add"
        open={!!addTargetPlan}
        plan={addTargetPlan}
        onOpenChange={(open) => {
          if (!open) {
            setAddTargetPlan(null)
            clearSelection()
          }
        }}
      />

      <PlanFormDialog
        mode="edit"
        open={!!editTargetPlan}
        plan={editTargetPlan}
        onOpenChange={(open) => {
          if (!open) setEditTargetPlan(null)
        }}
      />

      <AlertDialog
        open={deleteTargetPlanId !== null}
        onOpenChange={() => setDeleteTargetPlanId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>이 작업은 되돌릴 수 없습니다.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTargetPlanId && deletePlanMutation(deleteTargetPlanId)}
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 드래그 시간 Tooltip */}
      {!isContextMenuOpen && selection && displaySelection && (
        <TimeTooltip x={selection.tooltipPosition.x} top={selection.tooltipPosition.top}>
          {displaySelection}
        </TimeTooltip>
      )}

      {/* hover 시간 Tooltip */}
      {!isContextMenuOpen && !selection && hoveredTime && displayHoveredTime && (
        <TimeTooltip x={hoveredTime.tooltipPosition.x} top={hoveredTime.tooltipPosition.top}>
          {displayHoveredTime}
        </TimeTooltip>
      )}
    </main>
  )
}
