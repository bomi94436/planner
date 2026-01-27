import type { Minutes, TimePosition } from '@daily/_types'
import { getPositionFromPointerEvent } from '@daily/_utils'
import { useCallback, useMemo, useRef, useState } from 'react'
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

// ExecutionBlock hover 정보
export interface ExecutionHoverInfo {
  startTimestamp: Date
  endTimestamp: Date
  x: number
  top: number
}

interface UseDragSelectionReturn {
  containerRef: React.RefObject<HTMLDivElement | null>
  timePosition: TimePosition | null
  normalizedSelection: { start: Minutes; end: Minutes } | null
  isDragging: boolean
  handlePointerDown: (e: React.PointerEvent<HTMLDivElement>) => void
  handlePointerMove: (e: React.PointerEvent<HTMLDivElement>) => void
  handlePointerUp: (e: React.PointerEvent<HTMLDivElement>) => void
  handlePointerLeave: () => void
  handleClick: () => void
  clearTimePosition: () => void
}

export function useDragSelection(): UseDragSelectionReturn {
  const containerRef = useRef<HTMLDivElement>(null)
  const [timePosition, setTimePosition] = useState<TimePosition | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // 드래그 시작
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current
    if (!container) return

    const containerRect = container.getBoundingClientRect()
    const { minutes, rowTop } = getPositionFromPointerEvent(e, containerRect)

    // Pointer Capture 설정
    container.setPointerCapture(e.pointerId)

    setTimePosition({
      start: minutes,
      end: minutes,
      x: e.clientX,
      rowTop,
      type: 'selection',
    })
    setIsDragging(true)
  }, [])

  // 드래그 중
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const container = containerRef.current
      if (!container) return

      const containerRect = container.getBoundingClientRect()
      const { hourIndex, minutes, rowTop } = getPositionFromPointerEvent(e, containerRect)

      // 드래그 중: end 업데이트
      if (isDragging) {
        setTimePosition((prev) => (prev ? { ...prev, end: minutes } : null))
        return
      }

      // selection 중
      if (timePosition?.type === 'selection' || timePosition?.end) {
        return
      }

      // hover 중: 단일 시간 표시 (59분까지만)
      const displayMinutes = Math.min(minutes, hourIndex * 60 + 59)
      setTimePosition({
        start: displayMinutes,
        x: e.clientX,
        rowTop,
        type: 'hover',
      })
    },
    [isDragging, timePosition]
  )

  // 드래그 종료
  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current
    if (!container) return

    container.releasePointerCapture(e.pointerId)
    setIsDragging(false)
  }, [])

  // 포인터가 영역을 벗어날 때
  const handlePointerLeave = useCallback(() => {
    if (!isDragging) {
      setTimePosition(null)
    }
  }, [isDragging])

  // 빈 영역 클릭 시 selection 해제 (드래그가 아닌 단순 클릭)
  const handleClick = useCallback(() => {
    if (timePosition?.end !== undefined) {
      // 드래그 거리가 거의 없으면 (단순 클릭) selection 해제
      if (Math.abs(timePosition.end - timePosition.start) < 2) {
        setTimePosition(null)
      }
    }
  }, [timePosition])

  // timePosition 초기화
  const clearTimePosition = useCallback(() => {
    setTimePosition(null)
  }, [])

  // 정규화된 selection (start < end 보장, selection일 때만)
  const normalizedSelection = useMemo(() => {
    if (!timePosition?.end) return null
    const { start, end } = timePosition
    return start <= end ? { start, end } : { start: end, end: start }
  }, [timePosition])

  return {
    containerRef,
    timePosition,
    normalizedSelection,
    isDragging,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerLeave,
    handleClick,
    clearTimePosition,
  }
}
