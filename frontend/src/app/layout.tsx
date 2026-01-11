import './globals.css'

import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import { AppSidebar } from '@/components/layout/app-sidebar'
import { LocatorInit } from '@/components/locator-init'
import { ScrollArea, SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Planner',
  description: '아날로그 플래너를 디지털로 옮긴 개인 생산성 앱',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <LocatorInit />
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset className="flex h-screen flex-col">
            <header className="flex h-12 shrink-0 items-center border-b px-4">
              <SidebarTrigger />
            </header>
            <ScrollArea className="min-h-0 flex-1">
              <main className="p-6">{children}</main>
            </ScrollArea>
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  )
}
