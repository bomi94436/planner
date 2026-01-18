import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'

type ApiHandler<T> = (
  request: NextRequest,
  context?: { params: Promise<T> }
) => Promise<NextResponse>

/**
 * API 핸들러를 감싸서 공통 에러 처리를 수행하는 HOF
 * - ZodError: 400 (유효성 검증 실패)
 * - SyntaxError: 400 (잘못된 JSON 형식)
 * - 기타 에러: 500 (서버 오류)
 */
export function withErrorHandler<T = unknown>(handler: ApiHandler<T>): ApiHandler<T> {
  return async (request: NextRequest, context?: { params: Promise<T> }) => {
    try {
      return await handler(request, context)
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
      }
      if (error instanceof SyntaxError) {
        return NextResponse.json({ error: '잘못된 JSON 형식입니다.' }, { status: 400 })
      }
      return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
    }
  }
}
