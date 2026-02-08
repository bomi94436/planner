import { useCallback, useMemo, useState } from 'react'

import { minutesToDayjs } from '@/lib/utils'
import { useDateStore } from '@/store'
import type { Minutes } from '@/types'
import type { Selection } from '~/daily/_types'
import { getPositionFromPointerEvent } from '~/daily/_utils'

interface UseSelectionReturn {
  selection: Selection | null
  normalizedSelection: { start: Minutes; end: Minutes } | null
  displaySelection: string | null
  isDragging: boolean
  handlePointerDown: (e: React.PointerEvent<HTMLDivElement>) => void
  handlePointerMove: (e: React.PointerEvent<HTMLDivElement>) => void
  handlePointerUp: (e: React.PointerEvent<HTMLDivElement>) => void
  handleClick: () => void
  clearSelection: () => void
}

export function useSelection(
  containerRef: React.RefObject<HTMLDivElement | null>
): UseSelectionReturn {
  const [selection, setSelection] = useState<Selection | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const { selectedDate } = useDateStore()

  // 드래그 시작
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const container = containerRef.current
      if (!container) return

      const containerRect = container.getBoundingClientRect()
      const { minutes, rowTop } = getPositionFromPointerEvent(e, containerRect)

      container.setPointerCapture(e.pointerId)

      setSelection({
        start: minutes,
        end: minutes,
        x: e.clientX,
        rowTop,
      })
      setIsDragging(true)
    },
    [containerRef]
  )

  // 드래그 중
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const container = containerRef.current
      if (!container) return

      const containerRect = container.getBoundingClientRect()
      const { minutes } = getPositionFromPointerEvent(e, containerRect)

      // 드래그 중: end 업데이트
      if (isDragging) {
        setSelection((prev) => (prev ? { ...prev, end: minutes } : null))
        return
      }
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
    if (selection?.end !== undefined) {
      // 드래그 거리가 거의 없으면 (단순 클릭) selection 해제
      if (Math.abs(selection.end - selection.start) < 2) {
        setSelection(null)
      }
    }
  }, [selection])

  // selection 초기화
  const clearSelection = useCallback(() => {
    setSelection(null)
  }, [])

  // 정규화된 selection (start < end 보장, selection일 때만)
  const normalizedSelection = useMemo(() => {
    if (!selection?.end) return null
    const { start, end } = selection
    return start <= end ? { start, end } : { start: end, end: start }
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
