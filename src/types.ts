export type TagColorKey = 'gold' | 'sage' | 'sky' | 'rose' | 'lavender' | 'clay'

export type StatusFilter = 'all' | 'active' | 'completed'

export type DateFilter = 'all' | 'today' | 'tomorrow' | 'week' | 'overdue' | 'none'

export type SortKey = 'created' | 'priority' | 'dueDate'

export type SortDirection = 'asc' | 'desc'

export type Priority = 'none' | 'low' | 'medium' | 'high'

export interface Tag {
  id: string
  name: string
  color: TagColorKey
  createdAt: number
  updatedAt: number
  deletedAt: number | null
}

export interface Task {
  id: string
  title: string
  completed: boolean
  priority: Priority
  dueDate: number | null
  createdAt: number
  completedAt: number | null
  updatedAt: number
  deletedAt: number | null
  tagIds: string[]
}
