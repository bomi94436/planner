import { BLOCK_PADDING } from '@daily/_constants'
import { PencilIcon, TrashIcon } from 'lucide-react'
import { useCallback } from 'react'

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui'
import type { Execution } from '@/types/execution'

interface ExecutionBlockProps {
  execution: Execution
  offsetInRow: number
  span: number
  isStart: boolean
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void
  onContextMenuChange?: (open: boolean) => void
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
  onContextMenuChange,
}: ExecutionBlockProps) {
  const leftPercent = (offsetInRow / 60) * 100
  const widthPercent = (span / 60) * 100

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
          className="absolute flex items-center overflow-hidden rounded text-sm text-white cursor-pointer"
          style={{
            bottom: `${BLOCK_PADDING}px`,
            top: `${BLOCK_PADDING}px`,
            left: `calc(${leftPercent}% + ${BLOCK_PADDING}px)`,
            width: `calc(${widthPercent}% - ${BLOCK_PADDING * 2}px)`,
            backgroundColor: execution.color || '#3b82f6',
          }}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={handleClick}
          onMouseMove={onMouseMove}
        >
          {isStart && <span className="truncate px-2">{execution.title}</span>}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onPointerDown={(e) => e.stopPropagation()}>
          <PencilIcon /> Edit
        </ContextMenuItem>
        <ContextMenuItem variant="destructive" onPointerDown={(e) => e.stopPropagation()}>
          <TrashIcon /> Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
