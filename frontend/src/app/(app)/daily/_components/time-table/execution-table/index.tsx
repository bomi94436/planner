'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useCallback, useMemo, useRef, useState } from 'react'

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
import { cn, minutesToDayjs } from '@/lib/utils'
import { useDateStore } from '@/store'
import type { Execution } from '@/types/execution'
import { deleteExecution, getExecutions } from '~/daily/_api/func'
import { useCurrentTime, useHoveredTime, useSelection } from '~/daily/_hooks'
import {
  getCurrentTimePosition,
  getSelectionForRow,
  getTimeBlocksForRow,
  preprocessTimeBlocks,
} from '~/daily/_utils'

import { CurrentTimeIndicator } from './current-time-indicator'
import { ExecutionBlock } from './execution-block'
import { ExecutionFormDialog } from './execution-form-dialog'
import { GridBackground } from './grid-background'
import { SelectionBlock } from './selection-block'
import { TimeTooltip } from './time-tooltip'

export function ExecutionTable() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [addTargetExecution, setAddTargetExecution] = useState<Partial<Execution> | null>(null)
  const [editTargetExecution, setEditTargetExecution] = useState<Execution | null>(null)
  const [deleteTargetExecutionId, setDeleteTargetExecutionId] = useState<number | null>(null)
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
  const { currentHourIndex, currerntMinutePercent } = useMemo(
    () => getCurrentTimePosition(now),
    [now]
  )
  const {
    hoveredTime,
    handleMouseMove,
    displayHoveredTime,
    handleMouseLeave,
    handleMouseMoveInExecution,
  } = useHoveredTime(containerRef)

  const { selectedDate } = useDateStore()

  const { data: processedExecutions } = useQuery({
    queryKey: ['executions', selectedDate],
    queryFn: () =>
      getExecutions({
        startTimestamp: dayjs(selectedDate).startOf('day').toISOString(),
        endTimestamp: dayjs(selectedDate).endOf('day').toISOString(),
      }),
    select: (data) => preprocessTimeBlocks(data ?? []),
  })

  const queryClient = useQueryClient()

  const { mutate: deleteExecutionMutation } = useMutation({
    mutationFn: (id: number) => deleteExecution(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['executions'] })
      setDeleteTargetExecutionId(null)
    },
  })

  const handleSelectionClick = useCallback(
    (selection: { start: number; end: number }): React.MouseEventHandler<HTMLDivElement> =>
      (e) => {
        e.stopPropagation()
        setAddTargetExecution({
          startTimestamp: minutesToDayjs(selection.start, selectedDate).toDate(),
          endTimestamp: minutesToDayjs(selection.end, selectedDate).toDate(),
        })
      },
    [selectedDate]
  )

  const handleEditExecutionClick = useCallback(
    (execution: Execution) => () => {
      setEditTargetExecution(execution)
    },
    []
  )

  const handleDeleteExecutionClick = useCallback(
    (id: number) => () => {
      setDeleteTargetExecutionId(id)
    },
    []
  )

  return (
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
        const rowExecutions = getTimeBlocksForRow(processedExecutions ?? [], hourIndex)
        const rowSelection = normalizedSelection
          ? getSelectionForRow(normalizedSelection.start, normalizedSelection.end, hourIndex)
          : null

        const isToday = now && dayjs(selectedDate).isSame(dayjs(), 'day')
        const showCurrentTime = isToday && currentHourIndex === hourIndex

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

            {showCurrentTime && <CurrentTimeIndicator minutePercent={currerntMinutePercent} />}

            {rowExecutions.map(({ item: execution, offsetInRow, span, isStart }) => (
              <ExecutionBlock
                key={`${execution.id}-${hourIndex}`}
                execution={execution}
                offsetInRow={offsetInRow}
                span={span}
                isStart={isStart}
                onMouseMove={handleMouseMoveInExecution(execution)}
                onContextMenuChange={setIsContextMenuOpen}
                handleEditClick={handleEditExecutionClick(execution)}
                handleDeleteClick={handleDeleteExecutionClick(execution.id)}
              />
            ))}
          </div>
        )
      })}

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
      <ExecutionFormDialog
        mode="add"
        open={!!addTargetExecution}
        execution={addTargetExecution}
        onOpenChange={(open) => {
          if (!open) {
            setAddTargetExecution(null)
            clearSelection()
          }
        }}
      />
      <ExecutionFormDialog
        mode="edit"
        open={!!editTargetExecution}
        execution={editTargetExecution}
        onOpenChange={(open) => {
          if (!open) setEditTargetExecution(null)
        }}
      />
      <AlertDialog
        open={deleteTargetExecutionId !== null}
        onOpenChange={() => setDeleteTargetExecutionId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>이 작업은 되돌릴 수 없습니다.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteTargetExecutionId && deleteExecutionMutation(deleteTargetExecutionId)
              }
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
