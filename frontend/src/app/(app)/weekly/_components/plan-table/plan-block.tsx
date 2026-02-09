import { PencilIcon, TrashIcon } from 'lucide-react'
import { useCallback } from 'react'

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui'
import type { Plan } from '@/types/plan'
import { BLOCK_PADDING, DAYS_COUNT } from '~/weekly/_constants'

interface PlanBlockProps {
  plan: Plan
  dayIndex: number
  topPx: number
  heightPx: number
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void
  onContextMenuChange?: (open: boolean) => void
  handleEditClick: () => void
  handleDeleteClick: () => void
}

/**
 * Plan 블럭 (그리드 컨테이너 위에 단일 블럭으로 렌더링)
 */
export function PlanBlock({
  plan,
  dayIndex,
  topPx,
  heightPx,
  onMouseMove,
  onContextMenuChange,
  handleEditClick,
  handleDeleteClick,
}: PlanBlockProps) {
  const columnWidthPercent = 100 / DAYS_COUNT
  const leftPercent = dayIndex * columnWidthPercent

  // 좌클릭 시 클릭 위치에 컨텍스트 메뉴 표시
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    e.currentTarget.dispatchEvent(
      new MouseEvent('contextmenu', {
        bubbles: true,
        clientX: e.clientX,
        clientY: e.clientY,
      })
    )
  }, [])

  return (
    <ContextMenu onOpenChange={onContextMenuChange}>
      <ContextMenuTrigger asChild>
        <div
          className="absolute z-10 flex items-start overflow-hidden rounded text-xs text-white cursor-pointer"
          style={{
            left: `calc(${leftPercent}% + ${BLOCK_PADDING}px)`,
            width: `calc(${columnWidthPercent}% - ${BLOCK_PADDING * 2}px)`,
            top: topPx + BLOCK_PADDING,
            height: heightPx - BLOCK_PADDING * 2,
            backgroundColor: plan.color || '#3b82f6',
          }}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={handleClick}
          onMouseMove={onMouseMove}
        >
          <span className="truncate px-1.5 py-0.5">{plan.title}</span>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onPointerDown={(e) => e.stopPropagation()} onClick={handleEditClick}>
          <PencilIcon />
          <span>Edit</span>
        </ContextMenuItem>
        <ContextMenuItem
          variant="destructive"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={handleDeleteClick}
        >
          <TrashIcon />
          <span>Delete</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
