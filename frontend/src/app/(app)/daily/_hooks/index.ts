import type { Minutes, NormalizedSelection, TimePosition } from '@daily/_types'
import { useCallback, useMemo, useState } from 'react'
import { useEffect } from 'react'

export function useCurrentTime() {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const interval = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  return now
}

interface DragSelection {
  start: Minutes
  end: Minutes
  // tooltip 위치 정보
  tooltipX: number
  tooltipRowTop: number
}

// 마우스 위치에서 totalMinutes 계산
function getMinutesFromMouseEvent(
  e: React.MouseEvent<HTMLDivElement>,
  rect: DOMRect,
  hourIndex: number
): Minutes {
  const x = e.clientX - rect.left
  const minuteInHour = Math.max(0, Math.min(60, Math.round((x / rect.width) * 60)))
  return hourIndex * 60 + minuteInHour
}

interface UseDragSelectionReturn {
  hoveredTime: TimePosition | null
  dragSelection: DragSelection | null
  normalizedSelection: NormalizedSelection | null
  isDragging: boolean
  handleMouseDown: (e: React.MouseEvent<HTMLDivElement>, hourIndex: number) => void
  handleMouseMove: (e: React.MouseEvent<HTMLDivElement>, hourIndex: number) => void
  handleMouseUp: () => void
  handleMouseLeave: (isDraggingOverride?: boolean) => void
  handleClick: () => void
  handleGlobalMouseUp: () => void
  clearHoveredTime: () => void
  clearDragSelection: () => void
}

export function useDragSelection(): UseDragSelectionReturn {
  const [hoveredTime, setHoveredTime] = useState<TimePosition | null>(null)
  const [dragSelection, setDragSelection] = useState<DragSelection | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // 드래그 시작
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>, hourIndex: number) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const minutes = getMinutesFromMouseEvent(e, rect, hourIndex)

    setDragSelection({
      start: minutes,
      end: minutes,
      tooltipX: e.clientX,
      tooltipRowTop: rect.top,
    })
    setIsDragging(true)
  }, [])

  // 드래그 중 (row별 이벤트)
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, hourIndex: number) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const minutes = getMinutesFromMouseEvent(e, rect, hourIndex)

      // Tooltip 업데이트 (59분까지만 표시)
      const displayMinutes = Math.min(minutes, hourIndex * 60 + 59)
      setHoveredTime({
        minutes: displayMinutes,
        x: e.clientX,
        rowTop: rect.top,
      })

      // 드래그 중일 때 selection 업데이트
      if (isDragging) {
        setDragSelection((prev) => (prev ? { ...prev, end: minutes } : null))
      }
    },
    [isDragging]
  )

  // 드래그 종료
  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // 마우스가 영역을 벗어날 때
  const handleMouseLeave = useCallback(
    (isDraggingOverride?: boolean) => {
      if (!(isDraggingOverride ?? isDragging)) {
        setHoveredTime(null)
      }
    },
    [isDragging]
  )

  // 빈 영역 클릭 시 selection 해제 (드래그가 아닌 단순 클릭)
  const handleClick = useCallback(() => {
    if (dragSelection) {
      // 드래그 거리가 거의 없으면 (단순 클릭) selection 해제
      if (Math.abs(dragSelection.end - dragSelection.start) < 2) {
        setDragSelection(null)
      }
    }
  }, [dragSelection])

  // 컴포넌트 영역 밖에서 mouseup 처리
  const handleGlobalMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false)
    }
  }, [isDragging])

  // hoveredTime 초기화
  const clearHoveredTime = useCallback(() => {
    setHoveredTime(null)
  }, [])

  const clearDragSelection = useCallback(() => {
    setDragSelection(null)
  }, [])

  // 정규화된 selection (start < end 보장)
  const normalizedSelection = useMemo((): NormalizedSelection | null => {
    if (!dragSelection) return null
    const { start, end } = dragSelection
    return start <= end ? { start, end } : { start: end, end: start }
  }, [dragSelection])

  return {
    hoveredTime,
    dragSelection,
    normalizedSelection,
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    handleClick,
    handleGlobalMouseUp,
    clearHoveredTime,
    clearDragSelection,
  }
}
