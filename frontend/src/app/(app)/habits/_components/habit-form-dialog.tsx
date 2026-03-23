'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import type { HabitBase, UpdateHabitBody } from '@/types/habit'
import { createHabit, getCategories, updateHabit } from '~/habits/_api/func'

type DialogMode = 'add' | 'edit'

type HabitFormData = {
  name: string
  levelEasy: string
  levelNormal: string
  levelChallenge: string
  categoryId: number | null
}

interface HabitFormDialogProps {
  mode: DialogMode
  /** edit 모드에서 필수 - 수정할 Habit 데이터 */
  habit?: HabitBase
  /** Dialog open 상태 (controlled mode) */
  open?: boolean
  /** Dialog open 상태 변경 핸들러 (controlled mode) */
  onOpenChange?: (open: boolean) => void
  /** Trigger element (uncontrolled mode에서 사용) */
  children?: React.ReactNode
}

export function HabitFormDialog({
  mode,
  habit,
  open,
  onOpenChange,
  children,
}: HabitFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const queryClient = useQueryClient()

  // controlled vs uncontrolled
  const isOpen = open ?? internalOpen

  const { data: categoriesByGroup } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    select: (data) => {
      if (!data) return undefined
      return Map.groupBy(data, (category) => category.categoryGroup?.name ?? '미분류')
    },
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { isValid, isDirty },
  } = useForm<HabitFormData>({
    mode: 'onChange',
  })

  // dialog가 열릴 때 폼 데이터 초기화
  useEffect(() => {
    if (!isOpen) return
    if (mode === 'edit' && habit) {
      reset({
        name: habit.name,
        levelEasy: habit.levelEasy,
        levelNormal: habit.levelNormal,
        levelChallenge: habit.levelChallenge,
        categoryId: habit.categoryId,
      })
    } else {
      reset({
        name: '',
        levelEasy: '',
        levelNormal: '',
        levelChallenge: '',
        categoryId: null,
      })
    }
  }, [isOpen, mode, habit, reset])

  const { categoryId } = watch()

  const { mutate: createHabitMutation, isPending: isCreating } = useMutation({
    mutationFn: createHabit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] })
      handleOpenChange(false)
    },
  })

  const { mutate: updateHabitMutation, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateHabitBody }) => updateHabit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] })
      handleOpenChange(false)
    },
  })

  const isPending = isCreating || isUpdating

  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen)
    } else {
      setInternalOpen(newOpen)
    }
  }

  const onSubmit = (data: HabitFormData) => {
    const habitData = {
      name: data.name.trim(),
      levelEasy: data.levelEasy.trim(),
      levelNormal: data.levelNormal.trim(),
      levelChallenge: data.levelChallenge.trim(),
      categoryId: data.categoryId ?? null,
    }

    if (mode === 'edit' && habit) {
      updateHabitMutation({ id: habit.id, data: habitData })
    } else {
      createHabitMutation(habitData)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? '습관 수정' : '습관 추가'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 습관 이름 */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              습관 이름
            </label>
            <Input
              id="name"
              placeholder="습관 이름을 입력하세요"
              {...register('name', { required: true, validate: (v) => !!v.trim() })}
            />
          </div>

          {/* 🟢 쉬움 */}
          <div className="space-y-2">
            <label htmlFor="levelEasy" className="text-sm font-medium">
              🟢 쉬움
            </label>
            <Input
              id="levelEasy"
              placeholder="쉬운 단계 기준을 입력하세요"
              {...register('levelEasy', { required: true, validate: (v) => !!v.trim() })}
            />
          </div>

          {/* 🟡 보통 */}
          <div className="space-y-2">
            <label htmlFor="levelNormal" className="text-sm font-medium">
              🟡 보통
            </label>
            <Input
              id="levelNormal"
              placeholder="보통 단계 기준을 입력하세요"
              {...register('levelNormal', { required: true, validate: (v) => !!v.trim() })}
            />
          </div>

          {/* 🔴 챌린지 */}
          <div className="space-y-2">
            <label htmlFor="levelChallenge" className="text-sm font-medium">
              🔴 챌린지
            </label>
            <Input
              id="levelChallenge"
              placeholder="챌린지 단계 기준을 입력하세요"
              {...register('levelChallenge', { required: true, validate: (v) => !!v.trim() })}
            />
          </div>

          {/* 카테고리 선택 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">카테고리</label>
            <Select
              value={String(categoryId ?? '')}
              onValueChange={(v) =>
                setValue('categoryId', v ? Number(v) : null, { shouldDirty: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="카테고리 없음" />
              </SelectTrigger>
              <SelectContent>
                {Array.from(categoriesByGroup?.entries() ?? []).map(([groupName, categories]) => (
                  <SelectGroup key={groupName}>
                    <SelectLabel>{groupName}</SelectLabel>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        <span
                          className="size-2.5 rounded-full inline-block mr-1.5"
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending || !isValid || !isDirty}>
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
