'use client'

import { PlusIcon } from 'lucide-react'

import { Button } from '@/components/ui'

import { ExecutionTable } from './_components/execution-table'
import { PlanFormDialog } from './_components/plan-form-dialog'
import { PlanList } from './_components/plan-list'
import { mockTimeBlocks } from './mock-data'

export default function DailyPage() {
  return (
    <div className="flex min-h-0 flex-1 gap-4">
      <aside className="flex w-80 shrink-0 flex-col gap-2">
        <div className="flex items-center gap-x-2">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">계획</h2>
          <PlanFormDialog mode="add">
            <Button variant="secondary" size="icon-sm">
              <PlusIcon />
            </Button>
          </PlanFormDialog>
        </div>
        <PlanList />
      </aside>
      <main className="flex min-h-0 flex-1 flex-col gap-2">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">실행</h2>
        <ExecutionTable executions={mockTimeBlocks} />
      </main>
    </div>
  )
}
