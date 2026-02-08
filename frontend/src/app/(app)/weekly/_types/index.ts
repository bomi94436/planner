import type { Minutes } from '@/types'

export interface TooltipPosition {
  x: number
  top: number
}

export interface WeeklySelection {
  dayIndex: number // 드래그 중인 요일 컬럼 (0~6)
  start: Minutes // 시작 시간 (분)
  end: Minutes // 끝 시간 (분)
  tooltipPosition: TooltipPosition
}
