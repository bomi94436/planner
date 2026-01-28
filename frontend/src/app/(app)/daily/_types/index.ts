// 분 단위 시간 (START_HOUR 기준, 0 = 04:00)
export type Minutes = number

// 시간 위치 정보 (hover, selection, execution)
export interface Selection {
  start: Minutes
  end: Minutes
  x: number
  rowTop: number
}
