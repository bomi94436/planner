import { describe, expect, it } from 'vitest'

import { dateToMinutes, toHourIndex, toMinuteInHour } from './utils'

// START_HOUR = 4 기준
describe('dateToMinutes', () => {
  it('04:00은 0분을 반환한다', () => {
    expect(dateToMinutes(new Date('2024-01-01T04:00:00'))).toBe(0)
  })

  it('04:30은 30분을 반환한다', () => {
    expect(dateToMinutes(new Date('2024-01-01T04:30:00'))).toBe(30)
  })

  it('05:00은 60분을 반환한다', () => {
    expect(dateToMinutes(new Date('2024-01-01T05:00:00'))).toBe(60)
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
