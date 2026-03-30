'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useCallback, useMemo, useRef, useState } from 'react'
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
} from '@/components/ui'
import { hours } from '@/constants'
import { selectDayRange, useDateStore } from '@/store'
import type { Plan } from '@/types/plan'
import { cn, minutesToDayjs } from '@/utils'
import { deletePlan, getPlans } from '~/daily/_api/func'
import { useCurrentTime, useHoveredTime, useSelection } from '~/daily/_hooks'
import {
  getCurrentTimePosition,
  getSelectionForRow,
  getTimeBlocksForRow,
  preprocessTimeBlocks,
} from '~/daily/_utils'

import { CurrentTimeIndicator } from './current-time-indicator'
import { GridBackground } from './grid-background'
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
  } = useSelection(containerRef)

  const now = useCurrentTime()
  const currentTimePosition = useMemo(() => getCurrentTimePosition(now), [now])
  const {
    hoveredTime,
    handleMouseMove,
    displayHoveredTime,
    handleMouseLeave,
    handleMouseMoveInTimeBlock,
  } = useHoveredTime(containerRef)

  const { selectedDate, dayStartISO, dayEndISO } = useDateStore(useShallow(selectDayRange))

  const { data: processedPlans } = useQuery({
    queryKey: ['plans', dayStartISO, dayEndISO],
    queryFn: () =>
      getPlans({
        startTimestamp: dayStartISO,
        endTimestamp: dayEndISO,
      }),
    select: (data) => preprocessTimeBlocks(data ?? []),
  })

  const queryClient = useQueryClient()

  const { mutate: deletePlanMutation } = useMutation({
    mutationFn: (id: number) => deletePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] })
      setDeleteTargetPlanId(null)
    },
  })

  const handleSelectionClick = useCallback(
    (selection: { start: number; end: number }): React.MouseEventHandler<HTMLDivElement> =>
      (e) => {
        e.stopPropagation()
        setAddTargetPlan({
          startTimestamp: minutesToDayjs(selection.start, selectedDate).toDate(),
          endTimestamp: minutesToDayjs(selection.end, selectedDate).toDate(),
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
    <>
      <div
        ref={containerRef}
        className={cn('relative flex-1', {
          'cursor-col-resize select-none': isDragging,
        })}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onMouseMove={handleMouseMove}
        onPointerUp={handlePointerUp}
        onClick={handleClick}
        onMouseLeave={handleMouseLeave}
      >
        {hours.map((hourIndex) => {
          const rowPlans = getTimeBlocksForRow(processedPlans ?? [], hourIndex)
          const rowSelection = normalizedSelection
            ? getSelectionForRow(normalizedSelection.start, normalizedSelection.end, hourIndex)
            : null

          const isToday = now && dayjs(selectedDate).isSame(dayjs(), 'day')
          const showCurrentTime = isToday && currentTimePosition.hourIndex === hourIndex

          return (
            <div key={hourIndex} className="relative h-8 border-b border-zinc-200 last:border-b-0">
              <GridBackground />

              {rowSelection && normalizedSelection && (
                <SelectionBlock
                  startPercent={rowSelection.startPercent}
                  endPercent={rowSelection.endPercent}
                  onClick={handleSelectionClick(normalizedSelection)}
                />
              )}

              {showCurrentTime && (
                <CurrentTimeIndicator minutePercent={currentTimePosition.minutePercent} />
              )}

              {rowPlans.map(({ item: plan, offsetInRow, span, isStart }) => (
                <PlanBlock
                  key={`${plan.id}-${hourIndex}`}
                  plan={plan}
                  offsetInRow={offsetInRow}
                  span={span}
                  isStart={isStart}
                  onMouseMove={handleMouseMoveInTimeBlock(plan)}
                  onContextMenuChange={setIsContextMenuOpen}
                  handleEditClick={handleEditPlanClick(plan)}
                  handleDeleteClick={handleDeletePlanClick(plan.id)}
                />
              ))}
            </div>
          )
        })}
      </div>
      {/* 시간 Tooltip */}
      {!isContextMenuOpen && selection && displaySelection && (
        <TimeTooltip x={selection.x} top={selection.rowTop}>
          {displaySelection}
        </TimeTooltip>
      )}
      {/* hover 시간 Tooltip */}
      {!isContextMenuOpen && !selection && hoveredTime && displayHoveredTime && (
        <TimeTooltip x={hoveredTime.x} top={hoveredTime.rowTop}>
          {displayHoveredTime}
        </TimeTooltip>
      )}
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
    </>
  )
}
