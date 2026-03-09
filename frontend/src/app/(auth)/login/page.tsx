import { Chrome } from 'lucide-react'

import { Button } from '@/components/ui'
import { signIn } from '@/lib/auth'

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Planner</h1>
        <p className="text-muted-foreground text-sm">계속하려면 로그인하세요</p>
      </div>
      <form
        action={async () => {
          'use server'
          await signIn('google', { redirectTo: '/' })
        }}
      >
        <Button type="submit" variant="outline" className="w-full gap-2">
          <Chrome className="size-4" />
          Google로 로그인
        </Button>
      </form>
    </div>
  )
}
