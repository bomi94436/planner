import { NextResponse } from 'next/server'

import { auth } from '@/config/auth'

function isValidBasicAuth(authHeader: string): boolean {
  const base64 = authHeader.split(' ')[1]
  if (!base64) return false

  const credentials = atob(base64)
  const colonIndex = credentials.indexOf(':')
  const username = credentials.slice(0, colonIndex)
  const password = credentials.slice(colonIndex + 1)

  return username === process.env.SWAGGER_USER && password === process.env.SWAGGER_PASSWORD
}

export default auth((req) => {
  const { pathname } = req.nextUrl

  // /api-docs 경로는 HTTP Basic Auth로 보호
  if (pathname.startsWith('/api-docs')) {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !isValidBasicAuth(authHeader)) {
      return new NextResponse('Unauthorized', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="API Docs"',
        },
      })
    }
    return NextResponse.next()
  }

  const isLoggedIn = !!req.auth

  // 인증 처리가 /api/auth 경로들을 통해 이루어지기 때문에 인증 여부와 관계없이 /api/auth 경로들은 항상 접근 가능해야 함
  const isPublicPath = pathname.startsWith('/login') || pathname.startsWith('/api/auth')

  if (!isLoggedIn && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  if (isLoggedIn && pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/', req.nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|ico|webp)).*)'],
}
