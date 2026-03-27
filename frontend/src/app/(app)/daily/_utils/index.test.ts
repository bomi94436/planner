import { describe, expect, it } from 'vitest'

import type { ProcessedTimeBlock } from './index'
import {
  formatHour,
  getCurrentTimePosition,
  getPositionFromCoordinates,
  getSelectionForRow,
  getTimeBlocksForRow,
  preprocessTimeBlocks,
} from './index'

// START_HOUR=4, HOURS_PER_DAY=24, MINUTES_PER_HOUR=60, ROW_HEIGHT=32

describe('formatHour', () => {
  it('hourIndex=0 → "04"', () => {
    expect(formatHour(0)).toBe('04')
  })

  it('hourIndex=5 → "09"', () => {
    expect(formatHour(5)).toBe('09')
  })

  it('hourIndex=20 → "00" (자정 wrap-around)', () => {
    expect(formatHour(20)).toBe('00')
  })

  it('hourIndex=23 → "03"', () => {
    expect(formatHour(23)).toBe('03')
  })
})

describe('preprocessTimeBlocks', () => {
  it('빈 배열은 빈 배열을 반환한다', () => {
    expect(preprocessTimeBlocks([])).toEqual([])
  })

  it('일반적인 블럭: 04:00~05:00 → startIndex=0, endIndex=60', () => {
    const blocks = [
      {
        startTimestamp: new Date(2024, 0, 1, 4, 0, 0),
        endTimestamp: new Date(2024, 0, 1, 5, 0, 0),
      },
    ]
    const result = preprocessTimeBlocks(blocks)
    expect(result).toHaveLength(1)
    expect(result[0].startIndex).toBe(0)
    expect(result[0].endIndex).toBe(60)
  })

  it('2시간 이상 걸치는 블럭: 04:00~06:30 → startIndex=0, endIndex=150', () => {
    const blocks = [
      {
        startTimestamp: new Date(2024, 0, 1, 4, 0, 0),
        endTimestamp: new Date(2024, 0, 1, 6, 30, 0),
      },
    ]
    const result = preprocessTimeBlocks(blocks)
    expect(result[0].startIndex).toBe(0)
    expect(result[0].endIndex).toBe(150)
  })

  it('시작과 끝이 동일한 블럭은 endIndex를 startIndex+1로 보정한다', () => {
    const blocks = [
      {
        startTimestamp: new Date(2024, 0, 1, 4, 30, 0),
        endTimestamp: new Date(2024, 0, 1, 4, 30, 0),
      },
    ]
    const result = preprocessTimeBlocks(blocks)
    expect(result[0].startIndex).toBe(30)
    expect(result[0].endIndex).toBe(31)
  })

  it('01:00~04:00 블럭 (자정 넘긴 종료) → startIndex=1260, endIndex=1440', () => {
    const blocks = [
      {
        startTimestamp: new Date(2024, 0, 2, 1, 0, 0),
        endTimestamp: new Date(2024, 0, 2, 4, 0, 0),
      },
    ]
    const result = preprocessTimeBlocks(blocks)
    expect(result[0].startIndex).toBe(1260)
    expect(result[0].endIndex).toBe(1440)
  })

  it('03:30~04:00 블럭 (자정 넘긴 종료) → startIndex=1410, endIndex=1440', () => {
    const blocks = [
      {
        startTimestamp: new Date(2024, 0, 2, 3, 30, 0),
        endTimestamp: new Date(2024, 0, 2, 4, 0, 0),
      },
    ]
    const result = preprocessTimeBlocks(blocks)
    expect(result[0].startIndex).toBe(1410)
    expect(result[0].endIndex).toBe(1440)
  })
})

// hourIndex=1 기준: minutesStart=60, minutesEnd=120
describe('getTimeBlocksForRow', () => {
  type SimpleBlock = { startTimestamp: Date; endTimestamp: Date }

  const makeBlock = (startIndex: number, endIndex: number): ProcessedTimeBlock<SimpleBlock> => ({
    item: {
      startTimestamp: new Date(),
      endTimestamp: new Date(),
    },
    startIndex,
    endIndex,
  })

  it('row 안에서 시작하고 끝나는 블럭: offsetInRow=0, span=30, isStart=true', () => {
    const result = getTimeBlocksForRow([makeBlock(60, 90)], 1)
    expect(result).toHaveLength(1)
    expect(result[0].offsetInRow).toBe(0)
    expect(result[0].span).toBe(30)
    expect(result[0].isStart).toBe(true)
  })

  it('row 이전에 시작된 블럭: offsetInRow=0, span=30, isStart=false', () => {
    const result = getTimeBlocksForRow([makeBlock(30, 90)], 1)
    expect(result).toHaveLength(1)
    expect(result[0].offsetInRow).toBe(0)
    expect(result[0].span).toBe(30)
    expect(result[0].isStart).toBe(false)
  })

  it('row 이후까지 연장되는 블럭: offsetInRow=30, span=30, isStart=true', () => {
    const result = getTimeBlocksForRow([makeBlock(90, 150)], 1)
    expect(result).toHaveLength(1)
    expect(result[0].offsetInRow).toBe(30)
    expect(result[0].span).toBe(30)
    expect(result[0].isStart).toBe(true)
  })

  it('row 바로 앞에서 끝나는 블럭은 포함되지 않는다 (endIndex=minutesStart)', () => {
    const result = getTimeBlocksForRow([makeBlock(0, 60)], 1)
    expect(result).toHaveLength(0)
  })

  it('row 바로 뒤에서 시작하는 블럭은 포함되지 않는다 (startIndex=minutesEnd)', () => {
    const result = getTimeBlocksForRow([makeBlock(120, 180)], 1)
    expect(result).toHaveLength(0)
  })
})

describe('getCurrentTimePosition', () => {
  it('null이면 { hourIndex: 0, minutePercent: 0 }을 반환한다', () => {
    expect(getCurrentTimePosition(null)).toEqual({ hourIndex: 0, minutePercent: 0 })
  })

  it('START_HOUR 이후 시각 10:30 → hourIndex=6, minutePercent=50', () => {
    const now = new Date(2024, 0, 1, 10, 30, 0)
    const result = getCurrentTimePosition(now)
    expect(result).toEqual({ hourIndex: 6, minutePercent: 50 })
  })

  it('START_HOUR 이전 새벽 시각 02:00 → hourIndex=22, minutePercent=0', () => {
    const now = new Date(2024, 0, 1, 2, 0, 0)
    const result = getCurrentTimePosition(now)
    expect(result).toEqual({ hourIndex: 22, minutePercent: 0 })
  })

  it('START_HOUR 정각 04:00 → hourIndex=0, minutePercent=0', () => {
    const now = new Date(2024, 0, 1, 4, 0, 0)
    const result = getCurrentTimePosition(now)
    expect(result).toEqual({ hourIndex: 0, minutePercent: 0 })
  })
})

// hourIndex=1 기준: rowStart=60, rowEnd=120
describe('getSelectionForRow', () => {
  it('선택 범위가 row 이전에 끝나면 null 반환 (endMinutes=rowStart)', () => {
    expect(getSelectionForRow(0, 60, 1)).toBeNull()
  })

  it('선택 범위가 row 이후에 시작하면 null 반환 (startMinutes=rowEnd)', () => {
    expect(getSelectionForRow(120, 180, 1)).toBeNull()
  })

  it('선택 범위가 row 전체를 포함: startPercent=0, endPercent=100', () => {
    expect(getSelectionForRow(60, 120, 1)).toEqual({ startPercent: 0, endPercent: 100 })
  })

  it('선택 범위가 row 앞에서 시작: startPercent=0, endPercent=50', () => {
    expect(getSelectionForRow(30, 90, 1)).toEqual({ startPercent: 0, endPercent: 50 })
  })

  it('선택 범위가 row 중간에서 시작해 뒤로 넘어감: startPercent=50, endPercent=100', () => {
    expect(getSelectionForRow(90, 150, 1)).toEqual({ startPercent: 50, endPercent: 100 })
  })

  it('선택 범위가 row 내부: startPercent≈16.67, endPercent≈66.67', () => {
    const result = getSelectionForRow(70, 100, 1)
    expect(result).not.toBeNull()
    expect(result!.startPercent).toBeCloseTo(16.67, 1)
    expect(result!.endPercent).toBeCloseTo(66.67, 1)
  })
})

describe('getPositionFromCoordinates', () => {
  const rect = { top: 0, left: 0, width: 200 }

  it('원점 (0, 0): hourIndex=0, minutes=0, rowTop=0', () => {
    expect(getPositionFromCoordinates(0, 0, rect)).toEqual({ hourIndex: 0, minutes: 0, rowTop: 0 })
  })

  it('일반 좌표 (100, 64): hourIndex=2, minutes=150, rowTop=64', () => {
    expect(getPositionFromCoordinates(100, 64, rect)).toEqual({
      hourIndex: 2,
      minutes: 150,
      rowTop: 64,
    })
  })

  it('Y 음수는 클램프 → hourIndex=0, minutes=0, rowTop=0', () => {
    expect(getPositionFromCoordinates(0, -10, rect)).toEqual({
      hourIndex: 0,
      minutes: 0,
      rowTop: 0,
    })
  })

  it('Y 최대 초과는 클램프 → hourIndex=23, minutes=1380, rowTop=736', () => {
    expect(getPositionFromCoordinates(0, 769, rect)).toEqual({
      hourIndex: 23,
      minutes: 1380,
      rowTop: 736,
    })
  })

  it('X 음수는 클램프 → minuteInHour=0, minutes=60', () => {
    expect(getPositionFromCoordinates(-10, 32, rect)).toEqual({
      hourIndex: 1,
      minutes: 60,
      rowTop: 32,
    })
  })

  it('X 최대 초과는 클램프 → minuteInHour=60, minutes=120', () => {
    expect(getPositionFromCoordinates(210, 32, rect)).toEqual({
      hourIndex: 1,
      minutes: 120,
      rowTop: 32,
    })
  })

  it('containerRect에 offset이 있는 경우: top=32로 인해 rowTop=96', () => {
    const offsetRect = { top: 32, left: 0, width: 200 }
    expect(getPositionFromCoordinates(100, 96, offsetRect)).toEqual({
      hourIndex: 2,
      minutes: 150,
      rowTop: 96,
    })
  })
})
