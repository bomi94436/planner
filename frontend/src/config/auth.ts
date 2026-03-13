import NextAuth, { type DefaultSession } from 'next-auth'
import GitHub from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'

import { prisma } from '@/config/prisma'

declare module 'next-auth' {
  interface Session {
    user: { id: string } & DefaultSession['user']
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google, GitHub],
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  callbacks: {
    async jwt({ token, user, account: oauthAccount }) {
      // 로그인 이벤트 시에만 실행 (JWT 갱신 시에는 user/account가 undefined)
      if (user && oauthAccount) {
        const { provider, providerAccountId } = oauthAccount

        const { userId } = await prisma.account.upsert({
          where: { provider_providerAccountId: { provider, providerAccountId } },
          update: {},
          create: {
            provider,
            providerAccountId,
            user: { create: { email: user.email, name: user.name } },
          },
          select: { userId: true },
        })

        token['userId'] = userId
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token['userId'] as string
      return session
    },
  },
})
