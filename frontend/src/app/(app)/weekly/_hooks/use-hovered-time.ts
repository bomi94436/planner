import { useCallback, useMemo, useState } from 'react'

import { dateToMinutes, minutesToDayjs } from '@/lib/utils'
import { useDateStore } from '@/store'
import type { Minutes } from '@/types'
import type { Plan } from '@/types/plan'
import type { TooltipPosition } from '~/weekly/_types'
import { getPositionFromPointerEvent, getTooltipPosition } from '~/weekly/_utils'

interface HoveredTime {
  start: Minutes
  end?: Minutes
  tooltipPosition: TooltipPosition
}

export function useHoveredTime(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [hoveredTime, setHoveredTime] = useState<HoveredTime | null>(null)

  const { selectedDate } = useDateStore()

  // 그리드 빈 영역 hover
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const container = containerRef.current
      if (!container) return

      const containerRect = container.getBoundingClientRect()
      const { dayIndex, minutes } = getPositionFromPointerEvent(
        e as unknown as React.PointerEvent<HTMLDivElement>,
        containerRect
      )

      setHoveredTime({
        start: minutes,
        tooltipPosition: getTooltipPosition(containerRect, dayIndex, minutes),
      })
    },
    [containerRef]
  )

  // plan 블럭 hover → 시간 범위 표시 (마우스 위치 기반)
  const handleMouseMoveInPlan = useCallback(
    (plan: Plan) => (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation()

      const container = containerRef.current
      if (!container) return

      const containerRect = container.getBoundingClientRect()
      const { dayIndex, minutes } = getPositionFromPointerEvent(
        e as unknown as React.PointerEvent<HTMLDivElement>,
        containerRect
      )

      setHoveredTime({
        start: dateToMinutes(plan.startTimestamp),
        end: dateToMinutes(plan.endTimestamp),
        tooltipPosition: getTooltipPosition(containerRect, dayIndex, minutes),
      })
    },
    [containerRef]
  )

  const handleMouseLeave = useCallback(() => {
    setHoveredTime(null)
  }, [])

  const displayHoveredTime = useMemo(() => {
    if (!hoveredTime) return null
    if (hoveredTime.end !== undefined) {
      return `${minutesToDayjs(hoveredTime.start, selectedDate).format('HH:mm')} - ${minutesToDayjs(hoveredTime.end, selectedDate).format('HH:mm')}`
    }
    return minutesToDayjs(hoveredTime.start, selectedDate).format('HH:mm')
  }, [hoveredTime, selectedDate])

  return {
    hoveredTime,
    displayHoveredTime,
    handleMouseMove,
    handleMouseMoveInPlan,
    handleMouseLeave,
  }
}
