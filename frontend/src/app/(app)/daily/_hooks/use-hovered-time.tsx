import { useCallback, useMemo, useState } from 'react'

import { useDateStore } from '@/store'
import { Execution } from '@/types/execution'

import { Minutes } from '../_types'
import { dateToMinutes, getPositionFromPointerEvent, minutesToDayjs } from '../_utils'

interface HoveredTime {
  start: Minutes
  end?: Minutes
  x: number
  rowTop: number
}

export function useHoveredTime(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [hoveredTime, setHoveredTime] = useState<HoveredTime | null>(null)

  const { selectedDate } = useDateStore()

  /**
   * 타임 테이블 컨테이너 내부 mouse move 시 현재 시간 표시
   */
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const container = containerRef.current
      if (!container) return

      const containerRect = container.getBoundingClientRect()
      const { hourIndex, minutes, rowTop } = getPositionFromPointerEvent(e, containerRect)

      const displayMinutes = Math.min(minutes, hourIndex * 60 + 59)
      setHoveredTime({
        start: displayMinutes,
        x: e.clientX,
        rowTop,
      })
    },
    [containerRef]
  )

  /**
   * 실행 블럭 내부 mouse move 시 실행 블럭 시간 표시
   */
  const handleMouseMoveInExecution = useCallback(
    (execution: Execution) => (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation()

      const container = containerRef.current
      if (!container) return

      const containerRect = container.getBoundingClientRect()
      const { rowTop } = getPositionFromPointerEvent(e, containerRect)

      setHoveredTime({
        start: dateToMinutes(execution.startTimestamp),
        end: dateToMinutes(execution.endTimestamp),
        x: e.clientX,
        rowTop,
      })
    },
    [containerRef]
  )

  const handleMouseLeave = useCallback(() => {
    setHoveredTime(null)
  }, [])

  const displayHoveredTime = useMemo(() => {
    if (!hoveredTime) return null
    if (hoveredTime.end) {
      return `${minutesToDayjs(hoveredTime.start, selectedDate).format('HH:mm')} - ${minutesToDayjs(hoveredTime.end, selectedDate).format('HH:mm')}`
    }
    return minutesToDayjs(hoveredTime.start, selectedDate).format('HH:mm')
  }, [hoveredTime, selectedDate])

  return {
    hoveredTime,
    displayHoveredTime,
    handleMouseMove,
    handleMouseMoveInExecution,
    handleMouseLeave,
  }
}
