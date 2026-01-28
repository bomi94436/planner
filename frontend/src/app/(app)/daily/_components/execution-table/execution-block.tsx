import { BLOCK_PADDING } from '@daily/_constants'

import type { Execution } from '@/types/execution'

interface ExecutionBlockProps {
  execution: Execution
  offsetInRow: number
  span: number
  isStart: boolean
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void
}

/**
 * 타임블럭 (그리드 위에 overlay)
 */
export function ExecutionBlock({
  execution,
  offsetInRow,
  span,
  isStart,
  onMouseMove,
}: ExecutionBlockProps) {
  const leftPercent = (offsetInRow / 60) * 100
  const widthPercent = (span / 60) * 100

  return (
    <div
      className="absolute flex items-center overflow-hidden rounded text-sm text-white"
      style={{
        bottom: `${BLOCK_PADDING}px`,
        top: `${BLOCK_PADDING}px`,
        left: `calc(${leftPercent}% + ${BLOCK_PADDING}px)`,
        width: `calc(${widthPercent}% - ${BLOCK_PADDING * 2}px)`,
        backgroundColor: execution.color || '#3b82f6',
      }}
      onMouseMove={onMouseMove}
    >
      {isStart && <span className="truncate px-2">{execution.title}</span>}
    </div>
  )
}
