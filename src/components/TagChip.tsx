import type { TagColorKey } from '../types'
import { getTagPalette } from '../lib/tags'

interface TagChipProps {
  name: string
  color: TagColorKey
}

export function TagChip({ name, color }: TagChipProps) {
  const palette = getTagPalette(color)

  return (
    <span
      className="inline-flex max-w-full items-center gap-1.5 rounded-full px-2 py-0.5 text-xs"
      style={{ backgroundColor: palette.soft, color: palette.strong }}
    >
      <span
        className="size-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: palette.strong }}
      />
      <span className="truncate">{name}</span>
    </span>
  )
}
