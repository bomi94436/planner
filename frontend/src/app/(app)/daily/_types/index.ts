import type { Minutes } from '@/types'

// 시간 위치 정보 (hover, selection, execution)
export interface Selection {
  start: Minutes
  end: Minutes
  x: number
  rowTop: number
}
