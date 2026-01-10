'use client'

import setupLocatorUI from '@locator/runtime'
import { useEffect } from 'react'

// LocatorJS 초기화 컴포넌트 (개발 환경에서만 동작)
export function LocatorInit() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setupLocatorUI()
    }
  }, [])

  return null
}
