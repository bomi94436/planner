'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

import { LocatorInit } from './locator-init'
import { NextAuthSessionProvider } from './session-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <NextAuthSessionProvider>
      <QueryClientProvider client={queryClient}>
        <LocatorInit />
        {children}
      </QueryClientProvider>
    </NextAuthSessionProvider>
  )
}
