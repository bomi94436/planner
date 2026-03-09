'use client'

import { CheckIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

interface ColorPickerProps {
  colors: string[]
  selectedColor: string
  onColorChange: (color: string) => void
}

export function ColorPicker({ colors, selectedColor, onColorChange }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-border p-2">
      {colors.map((c) => (
        <button
          key={c}
          type="button"
          className="flex size-8 items-center justify-center rounded-full transition-all duration-300 hover:shadow-md"
          style={
            {
              backgroundColor: c,
              '--tw-shadow-color': `${c}50`,
            } as React.CSSProperties
          }
          onClick={() => onColorChange(c)}
        >
          <CheckIcon
            className={cn('size-6 text-white', {
              'fade-in-0 opacity-100 duration-300': c === selectedColor,
              'fade-out-0 opacity-0 duration-300': c !== selectedColor,
            })}
          />
        </button>
      ))}
    </div>
  )
}
