import { Card } from '@/components/ui'
import type { TimeBlock } from '@/types/daily'

interface TimetableProps {
  timeBlocks: TimeBlock[]
}

// 시작 시간 (04:00)
const START_HOUR = 4
// 총 시간 수 (24시간)
const TOTAL_HOURS = 24
// 한 시간당 블럭 수
const BLOCKS_PER_HOUR = 6
// 블럭 패딩
const BLOCK_PADDING = 2

// ISO 시간을 절대 블럭 인덱스로 변환 (04:00 = 0)
function toAbsoluteBlock(isoTime: string): number {
  const date = new Date(isoTime)
  let hour = date.getHours()
  if (hour < START_HOUR) hour += 24
  return (hour - START_HOUR) * BLOCKS_PER_HOUR + Math.floor(date.getMinutes() / 10)
}

// 시간 포맷팅
function formatHour(hourIndex: number): string {
  const hour = (START_HOUR + hourIndex) % 24
  return hour.toString().padStart(2, '0')
}

// 절대 블럭 인덱스가 계산된 타임블럭
type ProcessedBlock = { block: TimeBlock; blockStart: number; blockEnd: number }

// timeBlocks를 미리 처리 (절대 블럭 인덱스 계산)
function preprocessBlocks(timeBlocks: TimeBlock[]): ProcessedBlock[] {
  return timeBlocks.map((block) => ({
    block,
    blockStart: toAbsoluteBlock(block.startTimestamp),
    blockEnd: toAbsoluteBlock(block.endTimestamp),
  }))
}

// 특정 row에서 렌더링할 타임블럭 정보 계산
function getBlocksForRow(processedBlocks: ProcessedBlock[], hourIndex: number) {
  const rowStart = hourIndex * BLOCKS_PER_HOUR
  const rowEnd = rowStart + BLOCKS_PER_HOUR

  return processedBlocks
    .filter(({ blockStart, blockEnd }) => blockStart < rowEnd && blockEnd > rowStart)
    .map(({ block, blockStart, blockEnd }) => ({
      block,
      startBlock: Math.max(blockStart, rowStart) - rowStart,
      spanBlocks: Math.min(blockEnd, rowEnd) - Math.max(blockStart, rowStart),
      isStart: blockStart >= rowStart,
    }))
}

export function Timetable({ timeBlocks }: TimetableProps) {
  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => i)
  const processedBlocks = preprocessBlocks(timeBlocks)

  return (
    <Card className="gap-0 py-0">
      <div className="min-w-fit">
        {hours.map((hourIndex) => {
          const rowBlocks = getBlocksForRow(processedBlocks, hourIndex)

          return (
            <div
              key={hourIndex}
              className="flex border-b border-zinc-200 last:border-b-0 dark:border-zinc-800"
            >
              {/* 시간 라벨 */}
              <div className="flex h-8 w-10 shrink-0 items-center justify-end border-r border-zinc-200 px-2 text-right text-sm text-zinc-500 dark:border-zinc-800">
                {formatHour(hourIndex)}
              </div>

              {/* 그리드 + 블럭 영역 */}
              <div className="relative h-8 flex-1">
                {/* 기본 그리드 (항상 표시) */}
                <div className="absolute inset-0 flex">
                  {Array.from({ length: BLOCKS_PER_HOUR }, (_, i) => (
                    <div
                      key={i}
                      className="h-full flex-1 border-r border-zinc-100 last:border-r-0 dark:border-zinc-900"
                    />
                  ))}
                </div>

                {/* 타임블럭 (그리드 위에 overlay) */}
                {rowBlocks.map(({ block, startBlock, spanBlocks, isStart }) => {
                  const leftPercent = (startBlock / BLOCKS_PER_HOUR) * 100
                  const widthPercent = (spanBlocks / BLOCKS_PER_HOUR) * 100

                  return (
                    <div
                      key={`${block.id}-${hourIndex}`}
                      className="absolute flex items-center overflow-hidden rounded px-2 text-sm text-white"
                      style={{
                        bottom: `${BLOCK_PADDING}px`,
                        top: `${BLOCK_PADDING}px`,
                        left: `calc(${leftPercent}% + ${BLOCK_PADDING}px)`,
                        width: `calc(${widthPercent}% - ${BLOCK_PADDING * 2}px)`,
                        backgroundColor: block.color || '#3b82f6',
                      }}
                    >
                      {isStart && <span className="truncate">{block.title}</span>}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
