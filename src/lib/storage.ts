import type { Priority, Tag, TagColorKey, Task } from '../types'
import type { CustomPalette } from './palettes'
import { DEFAULT_THEME, THEME_IDS, THEME_STORAGE_KEY, type ThemeId } from './themes'

const TASKS_KEY = 'todo-app:tasks'
const TAGS_KEY = 'todo-app:tags'
const CUSTOM_PALETTE_KEY = 'todo-app:custom-theme'
const CUSTOM_CSS_KEY = 'todo-app:custom-theme-css'
const SAVED_PALETTES_KEY = 'todo-app:custom-palettes'
const ACTIVE_SYNC_USER_KEY = 'todo-app:sync-user'

const PRIORITIES: Priority[] = ['none', 'low', 'medium', 'high']

function isPriority(value: unknown): value is Priority {
  return typeof value === 'string' && PRIORITIES.includes(value as Priority)
}

export const DEFAULT_TAGS: Tag[] = [
  { id: 'preset-work', name: '工作', color: 'gold', createdAt: 0, updatedAt: 0, deletedAt: null },
  { id: 'preset-life', name: '生活', color: 'sage', createdAt: 0, updatedAt: 0, deletedAt: null },
  { id: 'preset-study', name: '学习', color: 'sky', createdAt: 0, updatedAt: 0, deletedAt: null },
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
    purgedAt: typeof raw.purgedAt === 'number' ? raw.purgedAt : null,
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
      const createdAt = typeof rawTag.createdAt === 'number' ? rawTag.createdAt : Date.now()
      return [
        {
          id: rawTag.id,
          name: rawTag.name,
          color: isTagColor(rawTag.color) ? rawTag.color : 'gold',
          createdAt,
          updatedAt: typeof rawTag.updatedAt === 'number' ? rawTag.updatedAt : createdAt,
          deletedAt: typeof rawTag.deletedAt === 'number' ? rawTag.deletedAt : null,
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

export function loadThemeId(): ThemeId {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored && THEME_IDS.includes(stored as ThemeId)) {
      return stored as ThemeId
    }
  } catch {
    // 本地存储不可用
  }
  return DEFAULT_THEME
}

export function saveThemeId(id: ThemeId): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, id)
  } catch {
    // 忽略写入失败
  }
}

export function loadCustomPalette(): CustomPalette | null {
  try {
    const raw = localStorage.getItem(CUSTOM_PALETTE_KEY)
    if (!raw) return null
    return normalizePalette(JSON.parse(raw))
  } catch {
    return null
  }
}

export function saveCustomPalette(palette: CustomPalette): void {
  try {
    localStorage.setItem(CUSTOM_PALETTE_KEY, JSON.stringify(palette))
  } catch {
    // 忽略写入失败
  }
}

export function saveCustomThemeCss(css: string): void {
  try {
    localStorage.setItem(CUSTOM_CSS_KEY, css)
  } catch {
    // 忽略写入失败
  }
}

function normalizePalette(value: unknown): CustomPalette | null {
  if (typeof value !== 'object' || value === null) return null

  const palette = value as Partial<CustomPalette>
  if (
    typeof palette.id !== 'string' ||
    typeof palette.name !== 'string' ||
    !Array.isArray(palette.colors) ||
    palette.colors.length < 2 ||
    !palette.colors.every((color) => typeof color === 'string')
  ) {
    return null
  }

  return {
    id: palette.id,
    name: palette.name,
    mode: palette.mode === 'tri' ? 'tri' : 'dual',
    colors: palette.colors,
  }
}

export function loadSavedPalettes(): CustomPalette[] {
  try {
    const raw = localStorage.getItem(SAVED_PALETTES_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.flatMap((value): CustomPalette[] => {
      const palette = normalizePalette(value)
      return palette ? [palette] : []
    })
  } catch {
    return []
  }
}

export function saveSavedPalettes(palettes: CustomPalette[]): void {
  try {
    localStorage.setItem(SAVED_PALETTES_KEY, JSON.stringify(palettes))
  } catch {
    // 忽略写入失败
  }
}

export function loadActiveSyncUser(): string | null {
  try {
    return localStorage.getItem(ACTIVE_SYNC_USER_KEY)
  } catch {
    return null
  }
}

export function saveActiveSyncUser(userId: string | null): void {
  try {
    if (userId) {
      localStorage.setItem(ACTIVE_SYNC_USER_KEY, userId)
    } else {
      localStorage.removeItem(ACTIVE_SYNC_USER_KEY)
    }
  } catch {
    // 忽略写入失败
  }
}
