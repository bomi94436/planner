import { type ClassValue, clsx } from 'clsx'
import dayjs from 'dayjs'
import { twMerge } from 'tailwind-merge'

import { HOURS_PER_DAY, MINUTES_PER_HOUR, START_HOUR } from '@/constants'
import type { Minutes } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date → Minutes 변환 (START_HOUR 기준, 1분 단위)
export function dateToMinutes(date: Date): Minutes {
  const d = new Date(date)
  let hour = d.getHours()
  if (hour < START_HOUR) hour += HOURS_PER_DAY
  return (hour - START_HOUR) * MINUTES_PER_HOUR + d.getMinutes()
}

// 분 → hourIndex 변환
export const toHourIndex = (minutes: Minutes): number => Math.floor(minutes / MINUTES_PER_HOUR)

// 분 → 해당 시간 내 분 (0-59)
export const toMinuteInHour = (minutes: Minutes): number => minutes % MINUTES_PER_HOUR

// 분 → dayjs 객체 (포맷팅용)
export const minutesToDayjs = (minutes: Minutes, baseDate: Date): dayjs.Dayjs => {
  const totalHours = START_HOUR + toHourIndex(minutes)
  const dayOffset = Math.floor(totalHours / HOURS_PER_DAY)
  const hour = totalHours % HOURS_PER_DAY
  return dayjs(baseDate).add(dayOffset, 'day').hour(hour).minute(toMinuteInHour(minutes))
}

// START_HOUR 기준 현재 플래너 날짜 반환 (04:00 이전이면 전날)
export const getCurrentPlannerDate = (): Date => {
  const now = dayjs()
  const d = now.hour() < START_HOUR ? now.subtract(1, 'day') : now
  return d.startOf('day').toDate()
}
