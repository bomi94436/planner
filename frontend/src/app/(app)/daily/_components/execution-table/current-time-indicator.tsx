import { BLOCK_PADDING } from '@daily/_constants'

interface CurrentTimeIndicatorProps {
  minutePercent: number
}

/**
 * 현재 시간 인디케이터
 */
export function CurrentTimeIndicator({ minutePercent }: CurrentTimeIndicatorProps) {
  return (
    <div
      className="absolute z-10"
      style={{
        left: `${minutePercent}%`,
        bottom: `${BLOCK_PADDING}px`,
        top: `${BLOCK_PADDING}px`,
      }}
    >
      <div className="h-full w-[3px] bg-primary rounded-full" />
    </div>
  )
}
