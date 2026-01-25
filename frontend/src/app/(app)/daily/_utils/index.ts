import { BLOCKS_PER_HOUR, START_HOUR } from '@daily/_constants'

import type { Execution } from '@/types/execution'

// ISO 시간을 절대 블럭 인덱스로 변환 (04:00 = 0)
export function toAbsoluteBlock(isoTime: string): number {
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
  return executions.map((execution) => ({
    execution,
    startIndex: toAbsoluteBlock(execution.startTimestamp.toISOString()),
    endIndex: toAbsoluteBlock(execution.endTimestamp.toISOString()),
  }))
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
