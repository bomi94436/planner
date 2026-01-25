import { BLOCKS_PER_HOUR, START_HOUR } from '@daily/_constants'
import type { Minutes } from '@daily/_types'
import dayjs from 'dayjs'

import type { Execution } from '@/types/execution'

// ISO 시간을 절대 블럭 인덱스로 변환 (04:00 = 0)
export function toAbsoluteBlock(isoTime: Date): number {
  const date = new Date(isoTime)
  let hour = date.getHours()
  if (hour < START_HOUR) hour += 24
  return (hour - START_HOUR) * BLOCKS_PER_HOUR + Math.floor(date.getMinutes() / 10)
}

// 시간 포맷팅
export function formatHour(hourIndex: number): string {
  const hour = (START_HOUR + hourIndex) % 24
  return hour.toString().padStart(2, '0')
}

// 절대 블럭 인덱스가 계산된 타임블럭
type ProcessedExecution = { execution: Execution; startIndex: number; endIndex: number }

// executions를 미리 처리 (절대 블럭 인덱스 계산)
export function preprocessExecutions(executions: Execution[]): ProcessedExecution[] {
  return executions.map((execution) => {
    const startIndex = toAbsoluteBlock(execution.startTimestamp)
    const endIndex = toAbsoluteBlock(execution.endTimestamp)

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
  const rowStart = hourIndex * BLOCKS_PER_HOUR
  const rowEnd = rowStart + BLOCKS_PER_HOUR

  return processedExecutions
    .filter(({ startIndex, endIndex }) => startIndex < rowEnd && endIndex > rowStart)
    .map(({ execution, startIndex, endIndex }) => ({
      execution,
      offsetInRow: Math.max(startIndex, rowStart) - rowStart,
      span: Math.min(endIndex, rowEnd) - Math.max(startIndex, rowStart),
      isStart: startIndex >= rowStart,
    }))
}

// 현재 시간 위치 계산
export function getCurrentTimePosition(now: Date | null) {
  if (!now) return { hourIndex: 0, minutePercent: 0 }
  let hour = now.getHours()
  if (hour < START_HOUR) hour += 24
  const hourIndex = hour - START_HOUR
  const minutePercent = (now.getMinutes() / 60) * 100
  return { hourIndex, minutePercent }
}

// ===== Minutes 관련 유틸리티 =====

// 분 → hourIndex 변환
export const toHourIndex = (minutes: Minutes): number => Math.floor(minutes / 60)

// 분 → 해당 시간 내 분 (0-59)
export const toMinuteInHour = (minutes: Minutes): number => minutes % 60

// 분 → dayjs 객체 (포맷팅용)
export const minutesToDayjs = (minutes: Minutes, baseDate: Date): dayjs.Dayjs => {
  const hour = (START_HOUR + toHourIndex(minutes)) % 24
  return dayjs(baseDate).hour(hour).minute(toMinuteInHour(minutes))
}

// 특정 row에서 selection 영역 계산 (퍼센트 반환)
export function getSelectionForRow(
  startMinutes: Minutes,
  endMinutes: Minutes,
  hourIndex: number
): { startPercent: number; endPercent: number } | null {
  const rowStartMinutes = hourIndex * 60
  const rowEndMinutes = rowStartMinutes + 60

  // 이 row가 selection 범위에 포함되는지 확인
  if (endMinutes <= rowStartMinutes || startMinutes >= rowEndMinutes) {
    return null
  }

  const clampedStart = Math.max(startMinutes, rowStartMinutes)
  const clampedEnd = Math.min(endMinutes, rowEndMinutes)

  return {
    startPercent: ((clampedStart - rowStartMinutes) / 60) * 100,
    endPercent: ((clampedEnd - rowStartMinutes) / 60) * 100,
  }
}
