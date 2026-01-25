import { BLOCK_PADDING } from '@daily/_constants'

interface SelectionOverlayProps {
  startPercent: number
  endPercent: number
  onClick: React.MouseEventHandler<HTMLDivElement>
}

/**
 * Selection 영역
 */
export function SelectionOverlay({ startPercent, endPercent, onClick }: SelectionOverlayProps) {
  // 부모의 mousedown이 새 selection을 시작하는 것을 막기 위해 stopPropagation
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
  }

  return (
    <div
      className="bg-primary/30 absolute rounded cursor-pointer"
      style={{
        top: `${BLOCK_PADDING}px`,
        bottom: `${BLOCK_PADDING}px`,
        left: `calc(${startPercent}% + ${BLOCK_PADDING}px)`,
        width: `calc(${endPercent - startPercent}% - ${BLOCK_PADDING * 2}px)`,
      }}
      onMouseDown={handleMouseDown}
      onClick={onClick}
    />
  )
}
