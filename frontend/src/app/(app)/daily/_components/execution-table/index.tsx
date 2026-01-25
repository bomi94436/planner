'use client'

import { BLOCK_PADDING, BLOCKS_PER_HOUR, START_HOUR, TOTAL_HOURS } from '@daily/_constants'
import { useCurrentTime } from '@daily/_hooks'
import {
  formatHour,
  getCurrentTimePosition,
  getExecutionsForRow,
  preprocessExecutions,
} from '@daily/_utils'
import dayjs from 'dayjs'
import { useState } from 'react'

import { Card } from '@/components/ui'
import { useDateStore } from '@/store'

interface HoveredTime {
  hourIndex: number
  minute: number
  x: number
  rowTop: number
}

export function ExecutionTable() {
  const processedExecutions = preprocessExecutions([])
  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => i)
  const [hoveredTime, setHoveredTime] = useState<HoveredTime | null>(null)

  const now = useCurrentTime()
  const { hourIndex: currentHourIndex, minutePercent } = getCurrentTimePosition(now)
  const { selectedDate } = useDateStore()

  return (
    <main className="flex min-h-0 flex-1 flex-col gap-2">
      <h2 className="text-lg font-semibold">실행</h2>

      <Card className="gap-0 py-0">
        <div className="min-w-fit">
          {hours.map((hourIndex) => {
            const rowExecutions = getExecutionsForRow(processedExecutions, hourIndex)

            return (
              <div key={hourIndex} className="flex border-b border-zinc-200 last:border-b-0">
                {/* 시간 라벨 */}
                <div className="flex h-8 w-10 shrink-0 items-center justify-end border-r border-zinc-200 px-2 text-right text-sm text-zinc-500 dark:border-zinc-800">
                  {formatHour(hourIndex)}
                </div>

                {/* 그리드 + 블럭 영역 */}
                <div
                  className="relative h-8 flex-1"
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const x = e.clientX - rect.left
                    const percent = x / rect.width
                    const minute = Math.floor(percent * 60)
                    setHoveredTime({
                      hourIndex,
                      minute: Math.max(0, Math.min(59, minute)),
                      x: e.clientX,
                      rowTop: rect.top,
                    })
                  }}
                  onMouseLeave={() => setHoveredTime(null)}
                >
                  {/* 기본 그리드 (항상 표시) */}
                  <div className="absolute inset-0 flex">
                    {Array.from({ length: BLOCKS_PER_HOUR }, (_, i) => (
                      <div
                        key={i}
                        className="h-full flex-1 border-r border-zinc-100 last:border-r-0"
                      />
                    ))}
                  </div>

                  {/* 현재 시간 인디케이터 */}
                  {now &&
                    dayjs(selectedDate).isSame(dayjs(), 'day') &&
                    currentHourIndex === hourIndex && (
                      <div
                        className="absolute z-10"
                        style={{
                          left: `${minutePercent}%`,
                          bottom: `${BLOCK_PADDING}px`,
                          top: `${BLOCK_PADDING}px`,
                        }}
                      >
                        <div className="h-full w-[3px] bg-primary rounded-full" />
                      </div>
                    )}

                  {/* 타임블럭 (그리드 위에 overlay) */}
                  {rowExecutions.map(({ execution, offsetInRow, span, isStart }) => {
                    const leftPercent = (offsetInRow / BLOCKS_PER_HOUR) * 100
                    const widthPercent = (span / BLOCKS_PER_HOUR) * 100

                    return (
                      <div
                        key={`${execution.id}-${hourIndex}`}
                        className="absolute flex items-center overflow-hidden rounded px-2 text-sm text-white"
                        style={{
                          bottom: `${BLOCK_PADDING}px`,
                          top: `${BLOCK_PADDING}px`,
                          left: `calc(${leftPercent}% + ${BLOCK_PADDING}px)`,
                          width: `calc(${widthPercent}% - ${BLOCK_PADDING * 2}px)`,
                          backgroundColor: execution.color || '#3b82f6',
                        }}
                      >
                        {isStart && <span className="truncate">{execution.title}</span>}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* 시간 Tooltip */}
      {hoveredTime && (
        <div
          className="pointer-events-none fixed z-50 flex flex-col items-center"
          style={{
            left: hoveredTime.x,
            top: hoveredTime.rowTop - 4,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="bg-foreground text-background rounded-md px-3 py-1.5 text-xs">
            {String((START_HOUR + hoveredTime.hourIndex) % 24).padStart(2, '0')}:
            {String(hoveredTime.minute).padStart(2, '0')}
          </div>
          {/* Arrow */}
          <div className="bg-foreground size-2.5 -mt-1.5 rotate-45 rounded-[2px]" />
        </div>
      )}
    </main>
  )
}
