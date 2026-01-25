'use client'

import { TOTAL_HOURS } from '@daily/_constants'
import { useCurrentTime, useDragSelection } from '@daily/_hooks'
import {
  formatHour,
  getCurrentTimePosition,
  getExecutionsForRow,
  getSelectionForRow,
  minutesToDayjs,
  preprocessExecutions,
} from '@daily/_utils'
import dayjs from 'dayjs'

import { Card } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useDateStore } from '@/store'

import { CurrentTimeIndicator } from './current-time-indicator'
import { ExecutionBlock } from './execution-block'
import { GridBackground } from './grid-background'
import { SelectionOverlay } from './selection-overlay'
import { TimeTooltip } from './time-tooltip'

export function ExecutionTable() {
  const processedExecutions = preprocessExecutions([])
  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => i)

  const {
    hoveredTime,
    dragSelection,
    normalizedSelection,
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    handleClick,
    handleGlobalMouseUp,
    clearHoveredTime,
  } = useDragSelection()

  const now = useCurrentTime()
  const { hourIndex: currentHourIndex, minutePercent } = getCurrentTimePosition(now)
  const { selectedDate } = useDateStore()

  return (
    <main className="flex min-h-0 flex-1 flex-col gap-2">
      <h2 className="text-lg font-semibold">실행</h2>

      <Card className="gap-0 py-0">
        <div
          className={cn('min-w-fit', {
            'cursor-col-resize select-none': isDragging,
          })}
          onMouseUp={handleGlobalMouseUp}
          onMouseLeave={clearHoveredTime}
        >
          {hours.map((hourIndex) => {
            const rowExecutions = getExecutionsForRow(processedExecutions, hourIndex)
            const rowSelection = normalizedSelection
              ? getSelectionForRow(normalizedSelection.start, normalizedSelection.end, hourIndex)
              : null

            const isToday = now && dayjs(selectedDate).isSame(dayjs(), 'day')
            const showCurrentTime = isToday && currentHourIndex === hourIndex

            return (
              <div key={hourIndex} className="flex border-b border-zinc-200 last:border-b-0">
                {/* 시간 라벨 */}
                <div className="flex h-8 w-10 shrink-0 items-center justify-end border-r border-zinc-200 px-2 text-right text-sm text-muted-foreground">
                  {formatHour(hourIndex)}
                </div>

                {/* 그리드 + 블럭 영역 */}
                <div
                  className={cn('relative h-8 flex-1', {
                    'cursor-col-resize': isDragging,
                  })}
                  onMouseDown={(e) => handleMouseDown(e, hourIndex)}
                  onMouseMove={(e) => handleMouseMove(e, hourIndex)}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={() => handleMouseLeave(isDragging)}
                  onClick={handleClick}
                >
                  <GridBackground />

                  {rowSelection && (
                    <SelectionOverlay
                      startPercent={rowSelection.startPercent}
                      endPercent={rowSelection.endPercent}
                    />
                  )}

                  {showCurrentTime && <CurrentTimeIndicator minutePercent={minutePercent} />}

                  {rowExecutions.map(({ execution, offsetInRow, span, isStart }) => (
                    <ExecutionBlock
                      key={`${execution.id}-${hourIndex}`}
                      execution={execution}
                      offsetInRow={offsetInRow}
                      span={span}
                      isStart={isStart}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* 시간 Tooltip (selection이 없을 때만 표시) */}
      {hoveredTime && !dragSelection && (
        <TimeTooltip x={hoveredTime.x} top={hoveredTime.rowTop}>
          {minutesToDayjs(hoveredTime.minutes, selectedDate).format('HH:mm')}
        </TimeTooltip>
      )}

      {/* Selection 시간 Tooltip */}
      {dragSelection && normalizedSelection && (
        <TimeTooltip x={dragSelection.tooltipX} top={dragSelection.tooltipRowTop}>
          {minutesToDayjs(normalizedSelection.start, selectedDate).format('HH:mm')}
          {' - '}
          {minutesToDayjs(normalizedSelection.end, selectedDate).format('HH:mm')}
        </TimeTooltip>
      )}
    </main>
  )
}
