import { BLOCK_PADDING, BLOCKS_PER_HOUR } from '@daily/_constants'

import type { Execution } from '@/types/execution'

interface ExecutionBlockProps {
  execution: Execution
  offsetInRow: number
  span: number
  isStart: boolean
}

/**
 * 타임블럭 (그리드 위에 overlay)
 */
export function ExecutionBlock({ execution, offsetInRow, span, isStart }: ExecutionBlockProps) {
  const leftPercent = (offsetInRow / BLOCKS_PER_HOUR) * 100
  const widthPercent = (span / BLOCKS_PER_HOUR) * 100

  return (
    <div
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
}
