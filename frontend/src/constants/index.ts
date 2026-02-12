/** 시작 시간 (04:00) */
export const START_HOUR = 4
/** 1일당 시간 수 */
export const HOURS_PER_DAY = 24
/** 1시간당 분 수 */
export const MINUTES_PER_HOUR = 60

/** 시간 배열 (0 ~ 23) */
export const hours = Array.from({ length: HOURS_PER_DAY }, (_, i) => i)
