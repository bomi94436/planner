import { BLOCK_PADDING, DAYS_COUNT } from '~/weekly/_constants'

interface SelectionBlockProps {
  dayIndex: number
  topPx: number
  heightPx: number
  onClick: React.MouseEventHandler<HTMLDivElement>
}

/**
 * Selection 영역 (그리드 컨테이너 위에 단일 블럭으로 렌더링)
 */
export function SelectionBlock({ dayIndex, topPx, heightPx, onClick }: SelectionBlockProps) {
  // 부모의 pointerdown이 새 selection을 시작하는 것을 막기 위해 stopPropagation
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation()
  }

  const columnWidthPercent = 100 / DAYS_COUNT
  const leftPercent = dayIndex * columnWidthPercent

  return (
    <div
      className="bg-primary/30 absolute rounded cursor-pointer"
      style={{
        left: `calc(${leftPercent}% + ${BLOCK_PADDING}px)`,
        width: `calc(${columnWidthPercent}% - ${BLOCK_PADDING * 2}px)`,
        top: topPx + BLOCK_PADDING,
        height: heightPx - BLOCK_PADDING * 2,
      }}
      onPointerDown={handlePointerDown}
      onClick={onClick}
    />
  )
}
