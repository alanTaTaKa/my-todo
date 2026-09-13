import type { Priority, SortDirection, SortKey, Task } from '../types'

const PRIORITY_RANK: Record<Priority, number> = {
  none: 0,
  low: 1,
  medium: 2,
  high: 3,
}

function compareBase(a: Task, b: Task, key: SortKey): number {
  switch (key) {
    case 'created':
      return a.createdAt - b.createdAt
    case 'priority':
      return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
    case 'dueDate':
      return (a.dueDate ?? 0) - (b.dueDate ?? 0)
  }
}

export function sortTasks(
  tasks: Task[],
  key: SortKey,
  direction: SortDirection,
): Task[] {
  const factor = direction === 'asc' ? 1 : -1

  return [...tasks].sort((a, b) => {
    if (key === 'dueDate') {
      if (a.dueDate === null && b.dueDate === null) return 0
      if (a.dueDate === null) return 1
      if (b.dueDate === null) return -1
    }
    return compareBase(a, b, key) * factor
  })
}
