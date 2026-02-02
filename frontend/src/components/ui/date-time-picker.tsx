'use client'
import dayjs from 'dayjs'
import { ChevronDownIcon } from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/lib/utils'

import { Button, Calendar, Input, Label, Popover, PopoverContent, PopoverTrigger, Switch } from '.'

interface DateTimePickerProps {
  startTimestamp: Date
  endTimestamp: Date
  isAllDay: boolean
  onStartTimestampChange: (date: Date) => void
  onEndTimestampChange: (date: Date) => void
  onIsAllDayChange?: (isAllDay: boolean) => void
}

export function DateTimePicker({
  startTimestamp,
  endTimestamp,
  isAllDay,
  onStartTimestampChange,
  onEndTimestampChange,
  onIsAllDayChange,
}: DateTimePickerProps) {
  const [isOpenStartDatePicker, setIsOpenStartDatePicker] = useState(false)
  const [isOpenEndDatePicker, setIsOpenEndDatePicker] = useState(false)

  return (
    <div className="flex w-full min-w-0 flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-sm w-7 font-medium">시작</span>
        <Popover open={isOpenStartDatePicker} onOpenChange={setIsOpenStartDatePicker}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn('w-fit justify-between font-normal', {
                'text-muted-foreground': !startTimestamp,
              })}
            >
              {startTimestamp ? dayjs(startTimestamp).format('YYYY. MM. DD.') : 'Select date'}
              <ChevronDownIcon className="size-4 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={startTimestamp}
              captionLayout="dropdown"
              onSelect={(date) => {
                if (!date) return
                onStartTimestampChange?.(date)

                if (dayjs(date).isAfter(endTimestamp)) {
                  onEndTimestampChange?.(date)
                }
                setIsOpenStartDatePicker(false)
              }}
            />
          </PopoverContent>
        </Popover>
        {!isAllDay && (
          <Input
            type="time"
            value={dayjs(startTimestamp).format('HH:mm')}
            className="w-fit bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            onChange={(e) => {
              const [hours, minutes] = e.target.value.split(':').map(Number)
              const newDate = dayjs(startTimestamp)
                .hour(hours)
                .minute(minutes)
                .second(0)
                .millisecond(0)
                .toDate()
              onStartTimestampChange?.(newDate)
            }}
            onBlur={() => {
              if (dayjs(startTimestamp).isAfter(endTimestamp)) {
                onEndTimestampChange?.(startTimestamp)
              }
            }}
          />
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm w-7 font-medium">끝</span>
        <Popover open={isOpenEndDatePicker} onOpenChange={setIsOpenEndDatePicker}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn('w-fit justify-between font-normal', {
                'text-muted-foreground': !endTimestamp,
              })}
            >
              {endTimestamp ? dayjs(endTimestamp).format('YYYY. MM. DD.') : 'Select date'}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={endTimestamp}
              captionLayout="dropdown"
              onSelect={(date) => {
                if (!date) return
                onEndTimestampChange?.(date)

                if (dayjs(date).isBefore(startTimestamp)) {
                  onStartTimestampChange?.(date)
                }
                setIsOpenEndDatePicker(false)
              }}
            />
          </PopoverContent>
        </Popover>
        {!isAllDay && (
          <Input
            type="time"
            value={dayjs(endTimestamp).format('HH:mm')}
            className="w-fit bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            onChange={(e) => {
              const [hours, minutes] = e.target.value.split(':').map(Number)
              const newDate = dayjs(endTimestamp)
                .hour(hours)
                .minute(minutes)
                .second(0)
                .millisecond(0)
                .toDate()
              onEndTimestampChange?.(newDate)
            }}
            onBlur={() => {
              if (dayjs(endTimestamp).isBefore(startTimestamp)) {
                onStartTimestampChange?.(endTimestamp)
              }
            }}
          />
        )}
      </div>

      {onIsAllDayChange && (
        <div className="flex items-center space-x-2 h-9">
          <Label htmlFor="all-day">하루종일</Label>
          <Switch id="all-day" checked={isAllDay} onCheckedChange={onIsAllDayChange} />
        </div>
      )}
    </div>
  )
}
