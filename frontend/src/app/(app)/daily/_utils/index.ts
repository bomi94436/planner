import { ROW_HEIGHT, START_HOUR, TOTAL_HOURS } from '@daily/_constants'
import type { Minutes } from '@daily/_types'
import dayjs from 'dayjs'

const MINUTES_PER_HOUR = 60
const HOURS_PER_DAY = 24

import type { Execution } from '@/types/execution'

// Date → Minutes 변환 (START_HOUR 기준, 1분 단위)
export function dateToMinutes(date: Date): Minutes {
  const d = new Date(date)
  let hour = d.getHours()
  if (hour < START_HOUR) hour += HOURS_PER_DAY
  return (hour - START_HOUR) * MINUTES_PER_HOUR + d.getMinutes()
}

// 시간 포맷팅
export function formatHour(hourIndex: number): string {
  const hour = (START_HOUR + hourIndex) % HOURS_PER_DAY
  return hour.toString().padStart(2, '0')
}

// 미리 처리된 execution
type ProcessedExecution = { execution: Execution; startIndex: number; endIndex: number }

// executions를 미리 처리 (Minutes 단위로 변환)
export function preprocessExecutions(executions: Execution[]): ProcessedExecution[] {
  return executions.map((execution) => {
    const startIndex = dateToMinutes(execution.startTimestamp)
    const endIndex = dateToMinutes(execution.endTimestamp)

    return {
      execution,
      startIndex,
      // 최소 1블럭 보장 (시작과 끝이 같은 블럭일 경우)
      endIndex: endIndex <= startIndex ? startIndex + 1 : endIndex,
    }
  })
}

// 특정 row에서 렌더링할 타임블럭 정보 계산
export function getExecutionsForRow(processedExecutions: ProcessedExecution[], hourIndex: number) {
  const minutesStart = hourIndex * MINUTES_PER_HOUR
  const minutesEnd = minutesStart + MINUTES_PER_HOUR

  return processedExecutions
    .filter(({ startIndex, endIndex }) => startIndex < minutesEnd && endIndex > minutesStart)
    .map(({ execution, startIndex, endIndex }) => ({
      execution,
      offsetInRow: Math.max(startIndex, minutesStart) - minutesStart,
      span: Math.min(endIndex, minutesEnd) - Math.max(startIndex, minutesStart),
      isStart: startIndex >= minutesStart,
    }))
}

// 분 → hourIndex 변환
export const toHourIndex = (minutes: Minutes): number => Math.floor(minutes / MINUTES_PER_HOUR)

// 분 → 해당 시간 내 분 (0-59)
export const toMinuteInHour = (minutes: Minutes): number => minutes % MINUTES_PER_HOUR

// 분 → dayjs 객체 (포맷팅용)
export const minutesToDayjs = (minutes: Minutes, baseDate: Date): dayjs.Dayjs => {
  const hour = (START_HOUR + toHourIndex(minutes)) % HOURS_PER_DAY
  return dayjs(baseDate).hour(hour).minute(toMinuteInHour(minutes))
}

// 현재 시간 위치 계산
export function getCurrentTimePosition(now: Date | null) {
  if (!now) return { hourIndex: 0, minutePercent: 0 }
  let hour = now.getHours()
  if (hour < START_HOUR) hour += 24
  const currentHourIndex = hour - START_HOUR
  const currerntMinutePercent = (now.getMinutes() / 60) * 100
  return { currentHourIndex, currerntMinutePercent }
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

// 포인터 위치에서 hourIndex와 minutes 계산
export function getPositionFromPointerEvent(
  e: React.PointerEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>,
  containerRect: DOMRect
): { hourIndex: number; minutes: Minutes; rowTop: number } {
  const y = e.clientY - containerRect.top
  const hourIndex = Math.max(0, Math.min(TOTAL_HOURS - 1, Math.floor(y / ROW_HEIGHT)))

  const x = e.clientX - containerRect.left
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
