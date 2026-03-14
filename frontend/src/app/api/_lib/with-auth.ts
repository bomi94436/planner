import { NextRequest, NextResponse } from 'next/server'

import { auth } from '@/config/auth'

import { withErrorHandler } from './with-error-handler'

type AuthHandler<T> = (
  request: NextRequest,
  context: { params: Promise<T>; userId: string }
) => Promise<NextResponse>

/**
 * 인증된 사용자만 접근할 수 있도록 withErrorHandler를 내부적으로 재사용하는 HOF
 * - 인증되지 않은 경우 401 반환
 * - 인증된 경우 userId를 context에 추가하여 핸들러 호출
 */
export function withAuth<T = unknown>(handler: AuthHandler<T>) {
  return withErrorHandler<T>(async (request, context) => {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }
    return handler(request, {
      params: context?.params as Promise<T>,
      userId: session.user.id,
    })
  })
}
