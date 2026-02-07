import dayjs from 'dayjs'

import { TOTAL_HOURS } from '@/constants'

/** 요일 배열 (일요일 ~ 토요일) */
export const days = Array.from({ length: 7 }, (_, i) => dayjs().locale('ko').day(i).format('ddd'))

/** 시간 배열 (0 ~ 23) */
export const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => i)

/** 행 높이 (h-16 = 64px) */
export const ROW_HEIGHT = 64
