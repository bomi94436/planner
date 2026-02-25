'use client'

import { useQuery } from '@tanstack/react-query'
import { useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { hours } from '@/constants'
import { selectDayRange, useDateStore } from '@/store'
import { useHoveredTime } from '~/daily/_hooks'
import { getTimeBlocksForRow, preprocessTimeBlocks } from '~/daily/_utils'
import { getPlans } from '~/weekly/_api/func'

import { GridBackground } from './grid-background'
import { PlanBlock } from './plan-block'
import { TimeTooltip } from './time-tooltip'

export function PlanTable() {
  const containerRef = useRef<HTMLDivElement>(null)
  const {
    hoveredTime,
    handleMouseMove,
    displayHoveredTime,
    handleMouseLeave,
    handleMouseMoveInTimeBlock,
  } = useHoveredTime(containerRef)

  const { dayStart, dayEnd } = useDateStore(useShallow(selectDayRange))

  const { data: processedPlans } = useQuery({
    queryKey: ['plans', dayStart.toISOString(), dayEnd.toISOString()],
    queryFn: () =>
      getPlans({
        startTimestamp: dayStart.toISOString(),
        endTimestamp: dayEnd.toISOString(),
      }),
    select: (data) => preprocessTimeBlocks(data ?? []),
  })

  return (
    <>
      <div
        ref={containerRef}
        className="relative flex-1"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {hours.map((hourIndex) => {
          const rowPlans = getTimeBlocksForRow(processedPlans ?? [], hourIndex)

          return (
            <div key={hourIndex} className="relative h-8 border-b border-zinc-200 last:border-b-0">
              <GridBackground />

              {rowPlans.map(({ item: plan, offsetInRow, span, isStart }) => (
                <PlanBlock
                  key={`${plan.id}-${hourIndex}`}
                  plan={plan}
                  offsetInRow={offsetInRow}
                  span={span}
                  isStart={isStart}
                  onMouseMove={handleMouseMoveInTimeBlock(plan)}
                />
              ))}
            </div>
          )
        })}
      </div>
      {/* hover 시간 Tooltip */}
      {hoveredTime && displayHoveredTime && (
        <TimeTooltip x={hoveredTime.x} top={hoveredTime.rowTop}>
          {displayHoveredTime}
        </TimeTooltip>
      )}
    </>
  )
}
