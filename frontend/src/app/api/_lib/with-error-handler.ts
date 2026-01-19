/* eslint-disable no-console */
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
      // 요청 정보 로깅
      const url = request.url
      const method = request.method

      if (error instanceof ZodError) {
        console.error(`[${method} ${url}] Validation Error:`, error.issues)
        return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
      }

      if (error instanceof SyntaxError) {
        console.error(`[${method} ${url}] Syntax Error:`, error.message)
        return NextResponse.json({ error: '잘못된 JSON 형식입니다.' }, { status: 400 })
      }

      // 500 에러의 경우 상세한 스택 트레이스 로깅
      console.error(`[${method} ${url}] Server Error:`, {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        error,
      })

      return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
    }
  }
}
