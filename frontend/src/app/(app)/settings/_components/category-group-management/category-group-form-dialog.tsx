'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

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
} from '@/components/ui'
import { COLOR_LIST } from '@/constants'
import type { CategoryGroup, CreateCategoryGroupBody } from '@/types/category-group'
import { createCategoryGroup, updateCategoryGroup } from '~/settings/_api/func'

type DialogMode = 'add' | 'edit'

interface CategoryGroupFormDialogProps {
  mode: DialogMode
  open?: boolean
  categoryGroup?: CategoryGroup | null
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

export function CategoryGroupFormDialog({
  mode,
  open,
  categoryGroup,
  onOpenChange,
  children,
}: CategoryGroupFormDialogProps) {
  const queryClient = useQueryClient()
  const [internalOpen, setInternalOpen] = useState(false)

  // controlled vs uncontrolled
  const isOpen = open ?? internalOpen
  const {
    register,
    handleSubmit,
    formState: { isValid },
    setValue,
    watch,
    reset,
  } = useForm<CreateCategoryGroupBody>({
    mode: 'onChange',
  })

  const color = watch('color')

  useEffect(() => {
    if (!isOpen) return
    reset({
      name: categoryGroup?.name ?? '',
      color: categoryGroup?.color ?? COLOR_LIST[0],
    })
  }, [isOpen, categoryGroup, reset])

  const { mutate: createMutation, isPending: isCreating } = useMutation({
    mutationFn: createCategoryGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categoryGroups'] })
      handleOpenChange(false)
    },
  })

  const { mutate: updateMutation, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateCategoryGroupBody }) =>
      updateCategoryGroup(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categoryGroups'] })
      handleOpenChange(false)
    },
  })

  const isPending = isCreating || isUpdating

  const onSubmit = (data: CreateCategoryGroupBody) => {
    const body = { name: data.name.trim(), color: data.color }
    if (mode === 'edit' && categoryGroup?.id) {
      updateMutation({ id: categoryGroup.id, data: body })
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
          <DialogTitle>{mode === 'edit' ? '카테고리 그룹 수정' : '카테고리 그룹 추가'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              이름
            </label>
            <Input
              id="name"
              {...register('name', { required: true, validate: (v) => !!v.trim() })}
              placeholder="그룹 이름을 입력하세요."
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
