import dayjs from 'dayjs'

import { HOURS_PER_DAY, MINUTES_PER_HOUR } from '@/constants'
import { dateToMinutes } from '@/lib/utils'
import type { Minutes } from '@/types'
import type { Plan } from '@/types/plan'
import { DAYS_COUNT, ROW_HEIGHT } from '~/weekly/_constants'

/** 드래그 스냅 단위 (분) */
const SNAP_MINUTES = 10

// 포인터 이벤트에서 dayIndex와 minutes 계산
export function getPositionFromPointerEvent(
  e: React.PointerEvent<HTMLDivElement>,
  containerRect: DOMRect
): { dayIndex: number; minutes: Minutes } {
  // Y축 → minutes
  const y = e.clientY - containerRect.top
  const hourIndex = Math.max(0, Math.min(HOURS_PER_DAY - 1, Math.floor(y / ROW_HEIGHT)))
  const rawMinuteInHour = ((y - hourIndex * ROW_HEIGHT) / ROW_HEIGHT) * MINUTES_PER_HOUR
  // 10분 단위로 스냅
  const minuteInHour = Math.max(
    0,
    Math.min(MINUTES_PER_HOUR, Math.round(rawMinuteInHour / SNAP_MINUTES) * SNAP_MINUTES)
  )

  // X축 → dayIndex
  const x = e.clientX - containerRect.left
  const columnWidth = containerRect.width / DAYS_COUNT
  const dayIndex = Math.max(0, Math.min(DAYS_COUNT - 1, Math.floor(x / columnWidth)))

  return {
    dayIndex,
    minutes: hourIndex * MINUTES_PER_HOUR + minuteInHour,
  }
}

// containerRect 기반으로 tooltip 위치 계산
export function getTooltipPosition(
  containerRect: DOMRect,
  dayIndex: number,
  minutes: Minutes
): { x: number; top: number } {
  const columnWidth = containerRect.width / DAYS_COUNT
  return {
    x: containerRect.left + dayIndex * columnWidth + columnWidth / 2,
    top: containerRect.top + (minutes / MINUTES_PER_HOUR) * ROW_HEIGHT,
  }
}

// 미리 처리된 plan
export type ProcessedPlan = { plan: Plan; startIndex: number; endIndex: number; dayIndex: number }

/** 그리드 최대 분 (START_HOUR 기준 24시간) */
const MAX_MINUTES = HOURS_PER_DAY * MINUTES_PER_HOUR

// plan을 그리드 일 단위로 분할하여 처리
// weekStart: 주의 시작일 (일요일 00:00)
export function preprocessPlans(plans: Plan[], weekStartISO: string): ProcessedPlan[] {
  const gridOrigin = dayjs(weekStartISO)

  return plans.flatMap((plan) => {
    const start = dayjs(plan.startTimestamp)
    const end = dayjs(plan.endTimestamp)

    // plan이 걸치는 그리드 일 범위
    const firstDay = Math.floor(start.diff(gridOrigin, 'minute') / MAX_MINUTES)
    const lastDay = Math.floor((end.diff(gridOrigin, 'minute') - 1) / MAX_MINUTES)

    const result: ProcessedPlan[] = []
    const firstVisibleDay = Math.max(0, firstDay)
    for (let day = firstVisibleDay; day <= Math.min(DAYS_COUNT - 1, lastDay); day++) {
      const startIndex = day === firstVisibleDay ? dateToMinutes(start.toDate()) : 0
      const endIndex = day === lastDay ? dateToMinutes(end.toDate()) : MAX_MINUTES

      result.push({
        plan,
        startIndex,
        endIndex: endIndex <= startIndex ? startIndex + 1 : endIndex,
        dayIndex: day,
      })
    }
    return result
  })
}
