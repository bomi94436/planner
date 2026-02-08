import type { Plan } from '@/types/plan'
import { BLOCK_PADDING, DAYS_COUNT } from '~/weekly/_constants'

interface PlanBlockProps {
  plan: Plan
  dayIndex: number
  topPx: number
  heightPx: number
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void
}

/**
 * Plan 블럭 (그리드 컨테이너 위에 단일 블럭으로 렌더링)
 */
export function PlanBlock({ plan, dayIndex, topPx, heightPx, onMouseMove }: PlanBlockProps) {
  const columnWidthPercent = 100 / DAYS_COUNT
  const leftPercent = dayIndex * columnWidthPercent

  return (
    <div
      className="absolute z-10 flex items-start overflow-hidden rounded text-xs text-white"
      style={{
        left: `calc(${leftPercent}% + ${BLOCK_PADDING}px)`,
        width: `calc(${columnWidthPercent}% - ${BLOCK_PADDING * 2}px)`,
        top: topPx + BLOCK_PADDING,
        height: heightPx - BLOCK_PADDING * 2,
        backgroundColor: plan.color || '#3b82f6',
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseMove={onMouseMove}
    >
      <span className="truncate px-1.5 py-0.5">{plan.title}</span>
    </div>
  )
}
