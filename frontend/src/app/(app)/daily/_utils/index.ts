import { HOURS_PER_DAY, MINUTES_PER_HOUR, START_HOUR } from '@/constants'
import type { Minutes } from '@/types'
import { dateToMinutes } from '@/utils'
import { ROW_HEIGHT } from '~/daily/_constants'

// 시간 포맷팅
export function formatHour(hourIndex: number): string {
  const hour = (START_HOUR + hourIndex) % HOURS_PER_DAY
  return hour.toString().padStart(2, '0')
}

// startTimestamp, endTimestamp를 가진 타입 제약
type TimeBlock = { startTimestamp: Date; endTimestamp: Date }

// 미리 처리된 타임블럭
export type ProcessedTimeBlock<T extends TimeBlock> = {
  item: T
  startIndex: number
  endIndex: number
}

// 타임블럭을 미리 처리 (Minutes 단위로 변환)
export function preprocessTimeBlocks<T extends TimeBlock>(blocks: T[]): ProcessedTimeBlock<T>[] {
  return blocks.map((item) => {
    const startIndex = dateToMinutes(item.startTimestamp)
    const endIndex = dateToMinutes(item.endTimestamp)

    // endIndex가 startIndex보다 작으면 자정(04:00)을 넘긴 것 → 하루치 분 추가
    const correctedEndIndex =
      endIndex < startIndex ? endIndex + HOURS_PER_DAY * MINUTES_PER_HOUR : endIndex

    return {
      item,
      startIndex,
      // 최소 1블럭 보장 (시작과 끝이 같은 블럭일 경우)
      endIndex: correctedEndIndex <= startIndex ? startIndex + 1 : correctedEndIndex,
    }
  })
}

// 특정 row에서 렌더링할 타임블럭 정보 계산
export function getTimeBlocksForRow<T extends TimeBlock>(
  processedBlocks: ProcessedTimeBlock<T>[],
  hourIndex: number
) {
  const minutesStart = hourIndex * MINUTES_PER_HOUR
  const minutesEnd = minutesStart + MINUTES_PER_HOUR

  return processedBlocks
    .filter(({ startIndex, endIndex }) => startIndex < minutesEnd && endIndex > minutesStart)
    .map(({ item, startIndex, endIndex }) => ({
      item,
      offsetInRow: Math.max(startIndex, minutesStart) - minutesStart,
      span: Math.min(endIndex, minutesEnd) - Math.max(startIndex, minutesStart),
      isStart: startIndex >= minutesStart,
    }))
}

// 현재 시간 위치 계산
export function getCurrentTimePosition(now: Date | null): {
  hourIndex: number
  minutePercent: number
} {
  if (!now) return { hourIndex: 0, minutePercent: 0 }
  let hour = now.getHours()
  if (hour < START_HOUR) hour += 24
  const hourIndex = hour - START_HOUR
  const minutePercent = (now.getMinutes() / 60) * 100
  return { hourIndex, minutePercent }
}

// 특정 row에서 selection 영역 계산 (퍼센트 반환)
export function getSelectionForRow(
  startMinutes: Minutes,
  endMinutes: Minutes,
  hourIndex: number
): { startPercent: number; endPercent: number } | null {
  const rowStartMinutes = hourIndex * MINUTES_PER_HOUR
  const rowEndMinutes = rowStartMinutes + MINUTES_PER_HOUR

  // 이 row가 selection 범위에 포함되는지 확인
  if (endMinutes <= rowStartMinutes || startMinutes >= rowEndMinutes) {
    return null
  }

  const clampedStart = Math.max(startMinutes, rowStartMinutes)
  const clampedEnd = Math.min(endMinutes, rowEndMinutes)

  return {
    startPercent: ((clampedStart - rowStartMinutes) / MINUTES_PER_HOUR) * 100,
    endPercent: ((clampedEnd - rowStartMinutes) / MINUTES_PER_HOUR) * 100,
  }
}

// 좌표에서 hourIndex와 minutes 계산
export function getPositionFromCoordinates(
  clientX: number,
  clientY: number,
  containerRect: Pick<DOMRect, 'top' | 'left' | 'width'>
): { hourIndex: number; minutes: Minutes; rowTop: number } {
  const y = clientY - containerRect.top
  const hourIndex = Math.max(0, Math.min(HOURS_PER_DAY - 1, Math.floor(y / ROW_HEIGHT)))

  const x = clientX - containerRect.left
  const minuteInHour = Math.max(
    0,
    Math.min(MINUTES_PER_HOUR, Math.round((x / containerRect.width) * MINUTES_PER_HOUR))
  )

  return {
    hourIndex,
    minutes: hourIndex * MINUTES_PER_HOUR + minuteInHour,
    rowTop: containerRect.top + hourIndex * ROW_HEIGHT,
  }
}
