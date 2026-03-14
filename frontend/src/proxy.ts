import { NextResponse } from 'next/server'

import { auth } from '@/config/auth'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl

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
