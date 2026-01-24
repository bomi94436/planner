import { Card } from '@/components/ui'

import { BLOCK_PADDING, BLOCKS_PER_HOUR, TOTAL_HOURS } from '../_constants'
import { formatHour, getExecutionsForRow, preprocessExecutions } from '../_utils'

export function ExecutionTable() {
  const processedExecutions = preprocessExecutions([])
  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => i)

  return (
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
              <div className="relative h-8 flex-1">
                {/* 기본 그리드 (항상 표시) */}
                <div className="absolute inset-0 flex">
                  {Array.from({ length: BLOCKS_PER_HOUR }, (_, i) => (
                    <div
                      key={i}
                      className="h-full flex-1 border-r border-zinc-100 last:border-r-0"
                    />
                  ))}
                </div>

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
  )
}
