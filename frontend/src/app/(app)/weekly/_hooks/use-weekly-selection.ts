import { useCallback, useMemo, useState } from 'react'

import { minutesToDayjs } from '@/lib/utils'
import { useDateStore } from '@/store'
import type { WeeklySelection } from '~/weekly/_types'
import { getPositionFromPointerEvent, getTooltipPosition } from '~/weekly/_utils'

interface UseWeeklySelectionReturn {
  selection: WeeklySelection | null
  normalizedSelection: { dayIndex: number; start: number; end: number } | null
  displaySelection: string | null
  isDragging: boolean
  handlePointerDown: (e: React.PointerEvent<HTMLDivElement>) => void
  handlePointerMove: (e: React.PointerEvent<HTMLDivElement>) => void
  handlePointerUp: (e: React.PointerEvent<HTMLDivElement>) => void
  handleClick: () => void
  clearSelection: () => void
}

export function useWeeklySelection(
  containerRef: React.RefObject<HTMLDivElement | null>
): UseWeeklySelectionReturn {
  const [selection, setSelection] = useState<WeeklySelection | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const { selectedDate } = useDateStore()

  // 드래그 시작
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const container = containerRef.current
      if (!container) return

      // 이미 selection이 있으면 해제만 하고 새 드래그를 시작하지 않음
      if (selection) {
        setSelection(null)
        return
      }

      const containerRect = container.getBoundingClientRect()
      const { dayIndex, minutes } = getPositionFromPointerEvent(e, containerRect)

      container.setPointerCapture(e.pointerId)

      setSelection({
        dayIndex,
        start: minutes,
        end: minutes,
        tooltipPosition: getTooltipPosition(containerRect, dayIndex, minutes),
      })
      setIsDragging(true)
    },
    [containerRef, selection]
  )

  // 드래그 중 (dayIndex는 고정, minutes만 업데이트)
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const container = containerRef.current
      if (!container || !isDragging) return

      const containerRect = container.getBoundingClientRect()
      const { minutes } = getPositionFromPointerEvent(e, containerRect)

      setSelection((prev) => {
        if (!prev) return null
        const topMinutes = Math.min(prev.start, minutes)
        return {
          ...prev,
          end: minutes,
          tooltipPosition: getTooltipPosition(containerRect, prev.dayIndex, topMinutes),
        }
      })
    },
    [isDragging, containerRef]
  )

  // 드래그 종료
  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const container = containerRef.current
      if (!container) return

      container.releasePointerCapture(e.pointerId)
      setIsDragging(false)
    },
    [containerRef]
  )

  // 빈 영역 클릭 시 selection 해제 (드래그가 아닌 단순 클릭)
  const handleClick = useCallback(() => {
    if (selection?.end && Math.abs(selection.end - selection.start) < 2) {
      setSelection(null)
    }
  }, [selection])

  // selection 초기화
  const clearSelection = useCallback(() => {
    setSelection(null)
  }, [])

  // 정규화된 selection (start < end 보장)
  const normalizedSelection = useMemo(() => {
    if (!selection?.end && selection?.end !== 0) return null
    const { dayIndex, start, end } = selection
    return start <= end ? { dayIndex, start, end } : { dayIndex, start: end, end: start }
  }, [selection])

  const displaySelection = useMemo(() => {
    if (!selection) return null
    const start = Math.min(selection.start, selection.end)
    const end = Math.max(selection.start, selection.end)
    return `${minutesToDayjs(start, selectedDate).format('HH:mm')} - ${minutesToDayjs(end, selectedDate).format('HH:mm')}`
  }, [selection, selectedDate])

  return {
    selection,
    normalizedSelection,
    displaySelection,
    isDragging,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleClick,
    clearSelection,
  }
}
