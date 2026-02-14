import type { Plan } from '@/types/plan'
import { BLOCK_PADDING } from '~/daily/_constants'

interface PlanBlockProps {
  plan: Plan
  offsetInRow: number
  span: number
  isStart: boolean
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void
}

/**
 * 타임블럭 (그리드 위에 overlay)
 */
export function PlanBlock({ plan, offsetInRow, span, isStart, onMouseMove }: PlanBlockProps) {
  const leftPercent = (offsetInRow / 60) * 100
  const widthPercent = (span / 60) * 100

  return (
    <div
      className="absolute flex items-center overflow-hidden rounded text-sm text-white opacity-60"
      style={{
        bottom: `${BLOCK_PADDING}px`,
        top: `${BLOCK_PADDING}px`,
        left: `calc(${leftPercent}% + ${BLOCK_PADDING}px)`,
        width: `calc(${widthPercent}% - ${BLOCK_PADDING * 2}px)`,
        backgroundColor: plan.color || '#3b82f6',
      }}
      onMouseMove={onMouseMove}
    >
      {isStart && <span className="truncate px-2">{plan.title}</span>}
    </div>
  )
}
