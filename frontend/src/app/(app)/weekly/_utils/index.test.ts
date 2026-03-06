import dayjs from 'dayjs'
import { describe, expect, it } from 'vitest'

import { getPositionFromCoordinates, getTooltipPosition, preprocessPlans } from './index'

// ROW_HEIGHT=64, HOURS_PER_DAY=24, MINUTES_PER_HOUR=60, DAYS_COUNT=7, SNAP_MINUTES=10

// weekStart = 2024-01-07(일) 00:00 로컬, MAX_MINUTES=1440, START_HOUR=4
const weekStartISO = dayjs(new Date(2024, 0, 7)).toISOString()

const makePlan = (start: Date, end: Date) => ({
  id: 1,
  title: '테스트',
  startTimestamp: start,
  endTimestamp: end,
  categoryId: null,
})

describe('getPositionFromCoordinates', () => {
  // containerRect.width=700 → columnWidth=100
  const rect = { top: 0, left: 0, width: 700 }

  it('원점 (0, 0) → dayIndex=0, minutes=0', () => {
    expect(getPositionFromCoordinates(0, 0, rect)).toEqual({ dayIndex: 0, minutes: 0 })
  })

  it('일반 좌표 (350, 128): hourIndex=2, minuteInHour=0 → dayIndex=3, minutes=120', () => {
    expect(getPositionFromCoordinates(350, 128, rect)).toEqual({ dayIndex: 3, minutes: 120 })
  })

  it('일반 좌표 (350, 96): hourIndex=1, minuteInHour=30 → dayIndex=3, minutes=90', () => {
    expect(getPositionFromCoordinates(350, 96, rect)).toEqual({ dayIndex: 3, minutes: 90 })
  })

  it('Y 음수는 클램프 → dayIndex=0, minutes=0', () => {
    expect(getPositionFromCoordinates(0, -10, rect)).toEqual({ dayIndex: 0, minutes: 0 })
  })

  it('Y 최대 초과는 클램프 → dayIndex=0, minutes=1440', () => {
    expect(getPositionFromCoordinates(0, 1600, rect)).toEqual({ dayIndex: 0, minutes: 1440 })
  })

  it('X 음수는 클램프 → dayIndex=0, minutes=60', () => {
    expect(getPositionFromCoordinates(-10, 64, rect)).toEqual({ dayIndex: 0, minutes: 60 })
  })

  it('X 최대 초과는 클램프 → dayIndex=6, minutes=60', () => {
    expect(getPositionFromCoordinates(750, 64, rect)).toEqual({ dayIndex: 6, minutes: 60 })
  })

  it('containerRect에 offset이 있는 경우: top=64, left=100으로 보정', () => {
    const offsetRect = { top: 64, left: 100, width: 700 }
    expect(getPositionFromCoordinates(450, 192, offsetRect)).toEqual({ dayIndex: 3, minutes: 120 })
  })
})

// containerRect.width=700 → columnWidth=100, ROW_HEIGHT=64
describe('getTooltipPosition', () => {
  const rect = {
    top: 0,
    left: 0,
    width: 700,
    height: 0,
    bottom: 0,
    right: 0,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect

  it('dayIndex=0, minutes=0 → x=50, top=0', () => {
    expect(getTooltipPosition(rect, 0, 0)).toEqual({ x: 50, top: 0 })
  })

  it('dayIndex=3, minutes=60 → x=350, top=64', () => {
    expect(getTooltipPosition(rect, 3, 60)).toEqual({ x: 350, top: 64 })
  })

  it('dayIndex=6, minutes=90 → x=650, top=96', () => {
    expect(getTooltipPosition(rect, 6, 90)).toEqual({ x: 650, top: 96 })
  })

  it('containerRect에 offset이 있는 경우: top=64, left=100으로 보정', () => {
    const offsetRect = {
      top: 64,
      left: 100,
      width: 700,
      height: 0,
      bottom: 0,
      right: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect
    expect(getTooltipPosition(offsetRect, 2, 30)).toEqual({ x: 350, top: 96 })
  })
})

describe('preprocessPlans', () => {
  it('빈 배열은 빈 배열을 반환한다', () => {
    expect(preprocessPlans([], weekStartISO)).toEqual([])
  })

  it('같은 날 내 plan: dayIndex=0, startIndex=0, endIndex=60', () => {
    // 2024-01-07 04:00~05:00 → dateToMinutes(04:00)=0, dateToMinutes(05:00)=60
    const plan = makePlan(new Date(2024, 0, 7, 4, 0, 0), new Date(2024, 0, 7, 5, 0, 0))
    const result = preprocessPlans([plan], weekStartISO)
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ startIndex: 0, endIndex: 60, dayIndex: 0 })
  })

  it('dayIndex=3인 중간 요일 plan: startIndex=360, endIndex=480', () => {
    // 2024-01-10(수) 10:00~12:00 → dateToMinutes(10:00)=360, dateToMinutes(12:00)=480
    const plan = makePlan(new Date(2024, 0, 10, 10, 0, 0), new Date(2024, 0, 10, 12, 0, 0))
    const result = preprocessPlans([plan], weekStartISO)
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ startIndex: 360, endIndex: 480, dayIndex: 3 })
  })

  it('이틀에 걸친 plan은 일(day)별로 분할된다', () => {
    // 2024-01-07 22:00 ~ 2024-01-08 02:00
    // Day 0: startIndex=dateToMinutes(22:00)=1080, endIndex=MAX_MINUTES=1440
    // Day 1: startIndex=0, endIndex=dateToMinutes(02:00)=1320
    const plan = makePlan(new Date(2024, 0, 7, 22, 0, 0), new Date(2024, 0, 8, 2, 0, 0))
    const result = preprocessPlans([plan], weekStartISO)
    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({ startIndex: 1080, endIndex: 1440, dayIndex: 0 })
    expect(result[1]).toMatchObject({ startIndex: 0, endIndex: 1320, dayIndex: 1 })
  })

  it('그리드(주) 이전에 끝나는 plan은 포함되지 않는다', () => {
    // 2024-01-06 10:00~12:00 (주 시작일 이전)
    const plan = makePlan(new Date(2024, 0, 6, 10, 0, 0), new Date(2024, 0, 6, 12, 0, 0))
    expect(preprocessPlans([plan], weekStartISO)).toHaveLength(0)
  })

  it('그리드(주) 이후에 시작하는 plan은 포함되지 않는다', () => {
    // 2024-01-14 10:00~12:00 (주 종료일 이후)
    const plan = makePlan(new Date(2024, 0, 14, 10, 0, 0), new Date(2024, 0, 14, 12, 0, 0))
    expect(preprocessPlans([plan], weekStartISO)).toHaveLength(0)
  })

  it('시작과 끝이 동일한 plan은 endIndex를 startIndex+1로 보정한다', () => {
    // 2024-01-07 06:00~06:00 → dateToMinutes(06:00)=120
    const plan = makePlan(new Date(2024, 0, 7, 6, 0, 0), new Date(2024, 0, 7, 6, 0, 0))
    const result = preprocessPlans([plan], weekStartISO)
    expect(result[0]).toMatchObject({ startIndex: 120, endIndex: 121, dayIndex: 0 })
  })
})
