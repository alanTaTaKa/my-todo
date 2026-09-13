import type { Priority, Tag, TagColorKey, Task } from '../types'

const TASKS_KEY = 'todo-app:tasks'
const TAGS_KEY = 'todo-app:tags'

const PRIORITIES: Priority[] = ['none', 'low', 'medium', 'high']

function isPriority(value: unknown): value is Priority {
  return typeof value === 'string' && PRIORITIES.includes(value as Priority)
}

export const DEFAULT_TAGS: Tag[] = [
  { id: 'preset-work', name: '工作', color: 'gold', createdAt: 0 },
  { id: 'preset-life', name: '生活', color: 'sage', createdAt: 0 },
  { id: 'preset-study', name: '学习', color: 'sky', createdAt: 0 },
]

const TAG_COLORS: TagColorKey[] = ['gold', 'sage', 'sky', 'rose', 'lavender', 'clay']

function isTagColor(value: unknown): value is TagColorKey {
  return typeof value === 'string' && TAG_COLORS.includes(value as TagColorKey)
}

function normalizeTask(value: unknown): Task | null {
  if (typeof value !== 'object' || value === null) return null

  const raw = value as Record<string, unknown>
  if (typeof raw.id !== 'string' || typeof raw.title !== 'string') return null

  const createdAt = typeof raw.createdAt === 'number' ? raw.createdAt : Date.now()
  const completed = raw.completed === true
  const updatedAt = typeof raw.updatedAt === 'number' ? raw.updatedAt : createdAt

  return {
    id: raw.id,
    title: raw.title,
    completed,
    priority: isPriority(raw.priority) ? raw.priority : 'none',
    dueDate: typeof raw.dueDate === 'number' ? raw.dueDate : null,
    createdAt,
    completedAt:
      typeof raw.completedAt === 'number'
        ? raw.completedAt
        : completed
          ? updatedAt
          : null,
    updatedAt,
    deletedAt: typeof raw.deletedAt === 'number' ? raw.deletedAt : null,
    tagIds: Array.isArray(raw.tagIds)
      ? raw.tagIds.filter((id): id is string => typeof id === 'string')
      : [],
  }
}

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .map(normalizeTask)
      .filter((task): task is Task => task !== null)
  } catch {
    return []
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
  } catch {
    // 本地存储不可用（隐私模式 / 容量超限）时静默失败，不影响使用
  }
}

export function loadTags(): Tag[] | null {
  try {
    const raw = localStorage.getItem(TAGS_KEY)
    if (raw === null) return null
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return null

    return parsed.flatMap((value): Tag[] => {
      if (typeof value !== 'object' || value === null) return []
      const rawTag = value as Record<string, unknown>
      if (typeof rawTag.id !== 'string' || typeof rawTag.name !== 'string') return []
      return [
        {
          id: rawTag.id,
          name: rawTag.name,
          color: isTagColor(rawTag.color) ? rawTag.color : 'gold',
          createdAt: typeof rawTag.createdAt === 'number' ? rawTag.createdAt : Date.now(),
        },
      ]
    })
  } catch {
    return null
  }
}

export function saveTags(tags: Tag[]): void {
  try {
    localStorage.setItem(TAGS_KEY, JSON.stringify(tags))
  } catch {
    // 同上
  }
}
