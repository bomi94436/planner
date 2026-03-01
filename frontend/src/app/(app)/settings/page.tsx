'use client'

import { CategoryGroupManagement } from './_components/category-group-management'
import { CategoryManagement } from './_components/category-management'

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Setting</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">설정을 관리하세요.</p>
      </div>

      <CategoryGroupManagement />
      <CategoryManagement />
    </div>
  )
}
