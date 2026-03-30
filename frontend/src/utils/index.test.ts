import { describe, expect, it, vi } from 'vitest'

import {
  dateToMinutes,
  getCurrentPlannerDate,
  minutesToDayjs,
  toHourIndex,
  toMinuteInHour,
} from '.'

// START_HOUR = 4 기준
describe('getCurrentPlannerDate', () => {
  it('04:00 이전 (01:00) → 전날 날짜 반환', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2024, 0, 2, 1, 0, 0)) // 2024-01-02 01:00
    const result = getCurrentPlannerDate()
    expect(result.getDate()).toBe(1) // 전날 (2024-01-01)
    vi.useRealTimers()
  })

  it('04:00 이후 (10:00) → 오늘 날짜 반환', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2024, 0, 2, 10, 0, 0)) // 2024-01-02 10:00
    const result = getCurrentPlannerDate()
    expect(result.getDate()).toBe(2) // 오늘 (2024-01-02)
    vi.useRealTimers()
  })

  it('정확히 04:00 → 오늘 날짜 반환', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2024, 0, 2, 4, 0, 0)) // 2024-01-02 04:00
    const result = getCurrentPlannerDate()
    expect(result.getDate()).toBe(2) // 오늘 (2024-01-02)
    vi.useRealTimers()
  })
})

describe('dateToMinutes', () => {
  it('04:00은 0분을 반환한다', () => {
    expect(dateToMinutes(new Date(2024, 0, 1, 4, 0, 0))).toBe(0)
  })

  it('04:30은 30분을 반환한다', () => {
    expect(dateToMinutes(new Date(2024, 0, 1, 4, 30, 0))).toBe(30)
  })

  it('05:00은 60분을 반환한다', () => {
    expect(dateToMinutes(new Date(2024, 0, 1, 5, 0, 0))).toBe(60)
  })
})

describe('toHourIndex', () => {
  it('90분은 hourIndex 1을 반환한다', () => {
    expect(toHourIndex(90)).toBe(1)
  })
})

describe('toMinuteInHour', () => {
  it('90분은 시간 내 30분을 반환한다', () => {
    expect(toMinuteInHour(90)).toBe(30)
  })
})

// START_HOUR=4, HOURS_PER_DAY=24, MINUTES_PER_HOUR=60 기준
describe('minutesToDayjs', () => {
  it('minutes=0 → 당일 04:00', () => {
    const result = minutesToDayjs(0, new Date(2024, 0, 1))
    expect(result.hour()).toBe(4)
    expect(result.minute()).toBe(0)
    expect(result.date()).toBe(1)
  })

  it('minutes=1080 → 당일 22:00', () => {
    const result = minutesToDayjs(1080, new Date(2024, 0, 1))
    expect(result.hour()).toBe(22)
    expect(result.minute()).toBe(0)
    expect(result.date()).toBe(1)
  })

  it('minutes=1200 → 다음날 00:00', () => {
    const result = minutesToDayjs(1200, new Date(2024, 0, 1))
    expect(result.hour()).toBe(0)
    expect(result.minute()).toBe(0)
    expect(result.date()).toBe(2)
  })

  it('minutes=1380 → 다음날 03:00', () => {
    const result = minutesToDayjs(1380, new Date(2024, 0, 1))
    expect(result.hour()).toBe(3)
    expect(result.minute()).toBe(0)
    expect(result.date()).toBe(2)
  })
})
