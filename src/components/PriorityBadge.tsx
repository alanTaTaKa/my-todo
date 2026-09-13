import type { Priority } from '../types'
import { getPriorityStyle } from '../lib/priority'

interface PriorityBadgeProps {
  priority: Priority
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  if (priority === 'none') return null

  const style = getPriorityStyle(priority)

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs"
      style={{ backgroundColor: style.soft, color: style.strong }}
    >
      <span
        className="size-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: style.strong }}
      />
      {style.short}
    </span>
  )
}
