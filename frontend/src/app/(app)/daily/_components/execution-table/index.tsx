'use client'

import { getExecutions } from '@daily/_api/func'
import { TOTAL_HOURS } from '@daily/_constants'
import { useCurrentTime, useHoveredTime, useSelection } from '@daily/_hooks'
import {
  formatHour,
  getCurrentTimePosition,
  getExecutionsForRow,
  getSelectionForRow,
  minutesToDayjs,
  preprocessExecutions,
} from '@daily/_utils'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { InfoIcon } from 'lucide-react'
import { useCallback, useMemo, useRef, useState } from 'react'

import { Card, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useDateStore } from '@/store'
import { Execution } from '@/types/execution'

import { CurrentTimeIndicator } from './current-time-indicator'
import { ExecutionBlock } from './execution-block'
import { ExecutionFormDialog } from './execution-form-dialog'
import { GridBackground } from './grid-background'
import { SelectionBlock } from './selection-block'
import { TimeTooltip } from './time-tooltip'

export function ExecutionTable() {
  const containerRef = useRef<HTMLDivElement>(null)
  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => i)
  const [targetPartialExecution, setTargetPartialExecution] = useState<Partial<Execution> | null>(
    null
  )
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
    select: (data) => preprocessExecutions(data ?? []),
  })

  const handleSelectionClick = useCallback(
    (selection: { start: number; end: number }): React.MouseEventHandler<HTMLDivElement> =>
      (e) => {
        e.stopPropagation()
        setTargetPartialExecution({
          startTimestamp: minutesToDayjs(selection.start, selectedDate).toDate(),
          endTimestamp: minutesToDayjs(selection.end, selectedDate).toDate(),
        })
      },
    [selectedDate]
  )

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

      <Card className="gap-0 py-0 rounded-lg">
        {/* 시간 라벨 컬럼 */}
        <div className="flex">
          <div className="w-10 shrink-0">
            {hours.map((hourIndex) => (
              <div
                key={hourIndex}
                className="flex h-8 items-center justify-end border-b border-r border-zinc-200 px-2 text-right text-sm text-muted-foreground last:border-b-0"
              >
                {formatHour(hourIndex)}
              </div>
            ))}
          </div>

          {/* 그리드 + 블럭 영역 (부모 container에서 pointer 이벤트 처리) */}
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
              const rowExecutions = getExecutionsForRow(processedExecutions ?? [], hourIndex)
              const rowSelection = normalizedSelection
                ? getSelectionForRow(normalizedSelection.start, normalizedSelection.end, hourIndex)
                : null

              const isToday = now && dayjs(selectedDate).isSame(dayjs(), 'day')
              const showCurrentTime = isToday && currentHourIndex === hourIndex

              return (
                <div
                  key={hourIndex}
                  className="relative h-8 border-b border-zinc-200 last:border-b-0"
                >
                  <GridBackground />

                  {rowSelection && normalizedSelection && (
                    <SelectionBlock
                      startPercent={rowSelection.startPercent}
                      endPercent={rowSelection.endPercent}
                      onClick={handleSelectionClick(normalizedSelection)}
                    />
                  )}

                  {showCurrentTime && (
                    <CurrentTimeIndicator minutePercent={currerntMinutePercent} />
                  )}

                  {rowExecutions.map(({ execution, offsetInRow, span, isStart }) => (
                    <ExecutionBlock
                      key={`${execution.id}-${hourIndex}`}
                      execution={execution}
                      offsetInRow={offsetInRow}
                      span={span}
                      isStart={isStart}
                      onMouseMove={handleMouseMoveInExecution(execution)}
                      onContextMenuChange={setIsContextMenuOpen}
                    />
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      </Card>

      <ExecutionFormDialog
        mode="add"
        open={!!targetPartialExecution}
        execution={targetPartialExecution}
        onOpenChange={(open) => {
          if (!open) {
            setTargetPartialExecution(null)
            clearSelection()
          }
        }}
      />

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
    </main>
  )
}
