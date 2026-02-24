/** 시작 시간 (04:00) */
export const START_HOUR = 4
/** 1일당 시간 수 */
export const HOURS_PER_DAY = 24
/** 1시간당 분 수 */
export const MINUTES_PER_HOUR = 60

/** 시간 배열 (0 ~ 23) */
export const hours = Array.from({ length: HOURS_PER_DAY }, (_, i) => i)

/** 색상 팔레트 (22색) */
export const COLOR_LIST: string[] = [
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
