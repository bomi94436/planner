import { BLOCKS_PER_HOUR } from '~/daily/_constants'

/**
 * 기본 그리드 (항상 표시)
 */
export function GridBackground() {
  return (
    <div className="absolute inset-0 flex">
      {Array.from({ length: BLOCKS_PER_HOUR }, (_, i) => (
        <div
          key={i}
          className="h-full flex-1 border-x-[0.5px] border-zinc-100 first:border-l-0 last:border-r-0"
        />
      ))}
    </div>
  )
}
