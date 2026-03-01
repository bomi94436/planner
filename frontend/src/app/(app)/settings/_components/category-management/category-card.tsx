'use client'

import { EllipsisIcon, TagIcon } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui'
import type { Category } from '@/types/category'

interface CategoryCardProps {
  category: Category
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
}

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-3 last:border-b-0">
      <div className="flex gap-3">
        <span className="size-3 rounded-full mt-1" style={{ backgroundColor: category.color }} />
        <div>
          <p className="text-sm font-medium">{category.name}</p>
          {category.categoryGroup && (
            <div className="flex items-center gap-1">
              <TagIcon className="size-4" style={{ color: category.categoryGroup.color }} />
              <p className="text-sm text-muted-foreground">{category.categoryGroup.name}</p>
            </div>
          )}
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className="rounded-md p-1 hover:bg-accent">
            <EllipsisIcon className="size-4 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(category)}>수정</DropdownMenuItem>
          <DropdownMenuItem className="text-destructive" onClick={() => onDelete(category)}>
            삭제
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
