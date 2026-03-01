'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { TagIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { ColorPicker } from '@/components/color-picker'
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import { COLOR_LIST } from '@/constants'
import type { Category, CreateCategoryBody } from '@/types/category'
import { createCategory, getCategoryGroups, updateCategory } from '~/settings/_api/func'

type DialogMode = 'add' | 'edit'

interface CategoryFormDialogProps {
  mode: DialogMode
  open?: boolean
  category?: Category | null
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

const NONE_VALUE = '__none__'

export function CategoryFormDialog({
  mode,
  open,
  category,
  onOpenChange,
  children,
}: CategoryFormDialogProps) {
  const queryClient = useQueryClient()
  const [internalOpen, setInternalOpen] = useState(false)

  // controlled vs uncontrolled
  const isOpen = open ?? internalOpen
  const { data: categoryGroups = [] } = useQuery({
    queryKey: ['categoryGroups'],
    queryFn: getCategoryGroups,
  })

  const {
    register,
    handleSubmit,
    formState: { isValid },
    setValue,
    watch,
    reset,
    control,
  } = useForm<CreateCategoryBody>({
    mode: 'onChange',
  })

  const color = watch('color')

  useEffect(() => {
    if (!isOpen) return
    reset({
      name: category?.name ?? '',
      color: category?.color ?? COLOR_LIST[0],
      categoryGroupId: category?.categoryGroupId ?? null,
    })
  }, [isOpen, category, reset])

  const { mutate: createMutation, isPending: isCreating } = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      handleOpenChange(false)
    },
  })

  const { mutate: updateMutation, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateCategoryBody }) =>
      updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      handleOpenChange(false)
    },
  })

  const isPending = isCreating || isUpdating

  const onSubmit = (data: CreateCategoryBody) => {
    const body: CreateCategoryBody = {
      name: data.name.trim(),
      color: data.color,
      categoryGroupId: data.categoryGroupId ?? null,
    }
    if (mode === 'edit' && category?.id) {
      updateMutation({ id: category.id, data: body })
    } else {
      createMutation(body)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen)
    } else {
      setInternalOpen(newOpen)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? '카테고리 수정' : '카테고리 추가'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="categoryName" className="text-sm font-medium">
              이름
            </label>
            <Input
              id="categoryName"
              {...register('name', { required: true, validate: (v) => !!v.trim() })}
              placeholder="카테고리 이름을 입력하세요."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">색상</label>
            <ColorPicker
              colors={COLOR_LIST}
              selectedColor={color}
              onColorChange={(c) => setValue('color', c)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">소속 그룹</label>
            <Controller
              control={control}
              name="categoryGroupId"
              render={({ field }) => (
                <Select
                  value={field.value != null ? String(field.value) : NONE_VALUE}
                  onValueChange={(value) =>
                    field.onChange(value === NONE_VALUE ? null : Number(value))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="그룹 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE_VALUE}>없음</SelectItem>
                    {categoryGroups.map((group) => (
                      <SelectItem
                        key={group.id}
                        value={String(group.id)}
                        className="flex items-center gap-1"
                      >
                        <TagIcon className="size-4" style={{ color: group.color }} />
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending || !isValid}>
              {isPending
                ? mode === 'edit'
                  ? '수정 중...'
                  : '추가 중...'
                : mode === 'edit'
                  ? '수정'
                  : '추가'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
