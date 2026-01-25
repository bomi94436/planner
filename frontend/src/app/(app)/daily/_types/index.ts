// 분 단위 시간 (START_HOUR 기준, 0 = 04:00)
export type Minutes = number

export interface TimePosition {
  minutes: Minutes
  x: number
  rowTop: number
}
