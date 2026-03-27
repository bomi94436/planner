import { describe, expect, it } from 'vitest'

import { dateToMinutes, minutesToDayjs, toHourIndex, toMinuteInHour } from '.'

// START_HOUR = 4 기준
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
