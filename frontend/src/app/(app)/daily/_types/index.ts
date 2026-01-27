// 분 단위 시간 (START_HOUR 기준, 0 = 04:00)
export type Minutes = number

// 시간 위치 정보 (hover, selection, execution)
export interface TimePosition {
  type: 'hover' | 'selection'
  start: Minutes
  end?: Minutes // selection 또는 execution일 때 존재
  x: number
  rowTop: number
}
