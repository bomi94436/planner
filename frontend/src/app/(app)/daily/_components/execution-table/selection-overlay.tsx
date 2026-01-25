import { BLOCK_PADDING } from '@daily/_constants'

interface SelectionOverlayProps {
  startPercent: number
  endPercent: number
}

/**
 * Selection 영역
 */
export function SelectionOverlay({ startPercent, endPercent }: SelectionOverlayProps) {
  return (
    <div
      className="bg-primary/30 absolute rounded"
      style={{
        top: `${BLOCK_PADDING}px`,
        bottom: `${BLOCK_PADDING}px`,
        left: `calc(${startPercent}% + ${BLOCK_PADDING}px)`,
        width: `calc(${endPercent - startPercent}% - ${BLOCK_PADDING * 2}px)`,
      }}
    />
  )
}
