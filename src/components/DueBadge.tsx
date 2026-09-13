import { formatDueDate, isOverdue } from '../lib/date'

interface DueBadgeProps {
  dueDate: number
  completed: boolean
}

export function DueBadge({ dueDate, completed }: DueBadgeProps) {
  const overdue = !completed && isOverdue(dueDate)

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
      style={
        overdue
          ? { backgroundColor: '#f3dcdc', color: '#c25b5b' }
          : { backgroundColor: 'var(--color-chip)', color: 'var(--color-chip-text)' }
      }
    >
      <svg viewBox="0 0 24 24" className="size-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4.5" width="18" height="16" rx="3" />
        <path d="M3 9.5h18M8 3v3M16 3v3" />
      </svg>
      {overdue ? `逾期 · ${formatDueDate(dueDate)}` : formatDueDate(dueDate)}
    </span>
  )
}
