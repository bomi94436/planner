const TOOLTIP_OFFSET = 4

interface TimeTooltipProps {
  x: number
  top: number
  children: React.ReactNode
}

export function TimeTooltip({ x, top, children }: TimeTooltipProps) {
  return (
    <div
      className="pointer-events-none fixed z-10 flex flex-col items-center"
      style={{
        left: x,
        top: top - TOOLTIP_OFFSET,
        transform: 'translate(-50%, -100%)',
      }}
    >
      <div className="bg-foreground text-background rounded-md px-3 py-1.5 text-xs whitespace-nowrap">
        {children}
      </div>
      {/* Arrow */}
      <div className="bg-foreground size-2.5 -mt-1.5 rotate-45 rounded-[2px]" />
    </div>
  )
}
