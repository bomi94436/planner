import dayjs from 'dayjs'

/** 요일 배열 (일요일 ~ 토요일) */
export const days = Array.from({ length: 7 }, (_, i) => dayjs().locale('ko').day(i).format('ddd'))

/** 행 높이 (h-16 = 64px) */
export const ROW_HEIGHT = 64

/** 블럭 패딩 */
export const BLOCK_PADDING = 2

/** 요일 수 */
export const DAYS_COUNT = 7

export const PLAN_COLOR_LIST: string[] = [
  '#57534e',
  '#525252',
  '#52525b',
  '#475569',
  '#4b5563',
  '#dc2626',
  '#ea580c',
  '#d97706',
  '#ca8a04',
  '#65a30d',
  '#16a34a',
  '#059669',
  '#0d9488',
  '#0891b2',
  '#0284c7',
  '#2563eb',
  '#4f46e5',
  '#7c3aed',
  '#9333ea',
  '#c026d3',
  '#db2777',
  '#e11d48',
]
