import { and, eq, gt, inArray, sql } from 'drizzle-orm'
import { Hono } from 'hono'
import { db } from '../db/index.js'
import { palettes, profiles, tags, tasks } from '../db/schema.js'
import { requireAuth, type AuthVariables } from '../auth/middleware.js'

const syncRoutes = new Hono<{ Variables: AuthVariables }>()

const PRIORITIES = ['none', 'low', 'medium', 'high'] as const
const COLORS = ['gold', 'sage', 'sky', 'rose', 'lavender', 'clay'] as const
const MAX_RECORDS = 2000
const MAX_ID_LENGTH = 100
const MAX_TITLE_LENGTH = 500
const MAX_TAG_NAME_LENGTH = 60
const SYNC_OVERLAP_MS = 2000
const HEX_PATTERN = /^#[0-9a-fA-F]{6}$/

type Priority = (typeof PRIORITIES)[number]
type Color = (typeof COLORS)[number]

interface TaskInput {
  id: string
  title: string
  completed: boolean
  priority: Priority
  dueDate: number | null
  createdAt: number
  completedAt: number | null
  updatedAt: number
  deletedAt: number | null
  purgedAt: number | null
  tagIds: string[]
}

interface TagInput {
  id: string
  name: string
  color: Color
  createdAt: number
  updatedAt: number
  deletedAt: number | null
}

interface PaletteInput {
  id: string
  name: string
  mode: 'dual' | 'tri'
  colors: string[]
  createdAt: number
  updatedAt: number
  deletedAt: number | null
}

interface ProfileInput {
  title: string
  subtitle: string
  updatedAt: number
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function asNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function normalizeTask(value: unknown): TaskInput | null {
  if (!isObject(value)) return null

  const id = typeof value.id === 'string' ? value.id.trim() : ''
  const title = typeof value.title === 'string' ? value.title.trim() : ''
  if (!id || id.length > MAX_ID_LENGTH) return null
  if (!title || title.length > MAX_TITLE_LENGTH) return null

  const createdAt = asNumber(value.createdAt)
  if (createdAt === null || createdAt < 0) return null
  const updatedAt = asNumber(value.updatedAt) ?? createdAt

  const priority =
    typeof value.priority === 'string' &&
    PRIORITIES.includes(value.priority as Priority)
      ? (value.priority as Priority)
      : 'none'

  const tagIds = Array.isArray(value.tagIds)
    ? value.tagIds
        .filter(
          (tagId): tagId is string =>
            typeof tagId === 'string' && tagId.length > 0 && tagId.length <= MAX_ID_LENGTH,
        )
        .slice(0, 100)
    : []

  return {
    id,
    title,
    completed: value.completed === true,
    priority,
    dueDate: asNumber(value.dueDate),
    createdAt,
    completedAt: asNumber(value.completedAt),
    updatedAt,
    deletedAt: asNumber(value.deletedAt),
    purgedAt: asNumber(value.purgedAt),
    tagIds,
  }
}

function normalizeTag(value: unknown): TagInput | null {
  if (!isObject(value)) return null

  const id = typeof value.id === 'string' ? value.id.trim() : ''
  const name = typeof value.name === 'string' ? value.name.trim() : ''
  if (!id || id.length > MAX_ID_LENGTH) return null
  if (!name || name.length > MAX_TAG_NAME_LENGTH) return null

  const createdAt = asNumber(value.createdAt)
  if (createdAt === null || createdAt < 0) return null
  const updatedAt = asNumber(value.updatedAt) ?? createdAt

  const color =
    typeof value.color === 'string' && COLORS.includes(value.color as Color)
      ? (value.color as Color)
      : 'gold'

  return {
    id,
    name,
    color,
    createdAt,
    updatedAt,
    deletedAt: asNumber(value.deletedAt),
  }
}

function normalizePalette(value: unknown): PaletteInput | null {
  if (!isObject(value)) return null

  const id = typeof value.id === 'string' ? value.id.trim() : ''
  const name = typeof value.name === 'string' ? value.name.trim() : ''
  if (!id || id.length > MAX_ID_LENGTH) return null
  if (!name || name.length > MAX_TAG_NAME_LENGTH) return null

  const createdAt = asNumber(value.createdAt)
  if (createdAt === null || createdAt < 0) return null
  const updatedAt = asNumber(value.updatedAt) ?? createdAt

  const rawColors = Array.isArray(value.colors) ? value.colors : []
  const colors = rawColors
    .filter(
      (color): color is string =>
        typeof color === 'string' && HEX_PATTERN.test(color.trim()),
    )
    .map((color) => color.trim().toLowerCase())
    .slice(0, 3)
  if (colors.length < 2) return null

  return {
    id,
    name,
    mode: colors.length === 3 ? 'tri' : 'dual',
    colors,
    createdAt,
    updatedAt,
    deletedAt: asNumber(value.deletedAt),
  }
}

function normalizeProfile(value: unknown): ProfileInput | null {
  if (!isObject(value)) return null

  const title = typeof value.title === 'string' ? value.title.trim() : ''
  const subtitle = typeof value.subtitle === 'string' ? value.subtitle.trim() : ''
  if (!title || title.length > 60 || subtitle.length > 120) return null

  const updatedAt = asNumber(value.updatedAt)
  if (updatedAt === null || updatedAt < 0) return null

  return { title, subtitle, updatedAt }
}

function toTaskDto(row: typeof tasks.$inferSelect) {
  return {
    id: row.id,
    title: row.title,
    completed: row.completed,
    priority: row.priority,
    dueDate: row.dueDate,
    createdAt: row.createdAt,
    completedAt: row.completedAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
    purgedAt: row.purgedAt,
    tagIds: row.tagIds,
  }
}

function toTagDto(row: typeof tags.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
  }
}

function toPaletteDto(row: typeof palettes.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    mode: row.mode,
    colors: row.colors,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
  }
}

function toProfileDto(row: typeof profiles.$inferSelect) {
  return {
    title: row.title,
    subtitle: row.subtitle,
    updatedAt: row.updatedAt,
  }
}

syncRoutes.get('/', requireAuth, async (c) => {
  const user = c.get('user')
  const requested = Number(c.req.query('since'))
  const since = Number.isFinite(requested) && requested > 0 ? requested : 0
  const serverTime = Date.now()
  const lowerBound = since > 0 ? Math.max(0, since - SYNC_OVERLAP_MS) : 0

  const taskRows = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.userId, user.id), gt(tasks.syncedAt, lowerBound)))

  const tagRows = await db
    .select()
    .from(tags)
    .where(and(eq(tags.userId, user.id), gt(tags.syncedAt, lowerBound)))

  const paletteRows = await db
    .select()
    .from(palettes)
    .where(and(eq(palettes.userId, user.id), gt(palettes.syncedAt, lowerBound)))

  const profileRows = await db
    .select()
    .from(profiles)
    .where(and(eq(profiles.userId, user.id), gt(profiles.syncedAt, lowerBound)))
    .limit(1)

  return c.json({
    serverTime,
    tasks: taskRows.map(toTaskDto),
    tags: tagRows.map(toTagDto),
    palettes: paletteRows.map(toPaletteDto),
    profile: profileRows[0] ? toProfileDto(profileRows[0]) : null,
  })
})

syncRoutes.post('/', requireAuth, async (c) => {
  const user = c.get('user')
  const body = await c.req.json().catch(() => null)
  if (!isObject(body)) {
    return c.json({ error: '请求格式不正确' }, 400)
  }

  const rawTasks = Array.isArray(body.tasks) ? body.tasks : []
  const rawTags = Array.isArray(body.tags) ? body.tags : []
  const rawPalettes = Array.isArray(body.palettes) ? body.palettes : []
  if (
    rawTasks.length > MAX_RECORDS ||
    rawTags.length > MAX_RECORDS ||
    rawPalettes.length > MAX_RECORDS
  ) {
    return c.json({ error: '单次同步数据量过大' }, 413)
  }

  const taskInputs = rawTasks
    .map(normalizeTask)
    .filter((task): task is TaskInput => task !== null)
  const tagInputs = rawTags
    .map(normalizeTag)
    .filter((tag): tag is TagInput => tag !== null)
  const paletteInputs = rawPalettes
    .map(normalizePalette)
    .filter((palette): palette is PaletteInput => palette !== null)
  const profileInput = isObject(body.profile) ? normalizeProfile(body.profile) : null

  const serverTime = Date.now()

  await db.transaction(async (tx) => {
    if (taskInputs.length > 0) {
      await tx
        .insert(tasks)
        .values(taskInputs.map((task) => ({ ...task, userId: user.id, syncedAt: serverTime })))
        .onConflictDoUpdate({
          target: [tasks.userId, tasks.id],
          set: {
            title: sql`excluded.title`,
            completed: sql`excluded.completed`,
            priority: sql`excluded.priority`,
            dueDate: sql`excluded.due_date`,
            createdAt: sql`excluded.created_at`,
            completedAt: sql`excluded.completed_at`,
            updatedAt: sql`excluded.updated_at`,
            deletedAt: sql`excluded.deleted_at`,
            purgedAt: sql`excluded.purged_at`,
            tagIds: sql`excluded.tag_ids`,
            syncedAt: sql`excluded.synced_at`,
          },
          setWhere: sql`excluded.updated_at > ${tasks.updatedAt}`,
        })
    }

    if (tagInputs.length > 0) {
      await tx
        .insert(tags)
        .values(tagInputs.map((tag) => ({ ...tag, userId: user.id, syncedAt: serverTime })))
        .onConflictDoUpdate({
          target: [tags.userId, tags.id],
          set: {
            name: sql`excluded.name`,
            color: sql`excluded.color`,
            createdAt: sql`excluded.created_at`,
            updatedAt: sql`excluded.updated_at`,
            deletedAt: sql`excluded.deleted_at`,
            syncedAt: sql`excluded.synced_at`,
          },
          setWhere: sql`excluded.updated_at > ${tags.updatedAt}`,
        })
    }

    if (paletteInputs.length > 0) {
      await tx
        .insert(palettes)
        .values(
          paletteInputs.map((palette) => ({
            ...palette,
            userId: user.id,
            syncedAt: serverTime,
          })),
        )
        .onConflictDoUpdate({
          target: [palettes.userId, palettes.id],
          set: {
            name: sql`excluded.name`,
            mode: sql`excluded.mode`,
            colors: sql`excluded.colors`,
            createdAt: sql`excluded.created_at`,
            updatedAt: sql`excluded.updated_at`,
            deletedAt: sql`excluded.deleted_at`,
            syncedAt: sql`excluded.synced_at`,
          },
          setWhere: sql`excluded.updated_at > ${palettes.updatedAt}`,
        })
    }

    if (profileInput) {
      await tx
        .insert(profiles)
        .values({ ...profileInput, userId: user.id, syncedAt: serverTime })
        .onConflictDoUpdate({
          target: profiles.userId,
          set: {
            title: sql`excluded.title`,
            subtitle: sql`excluded.subtitle`,
            updatedAt: sql`excluded.updated_at`,
            syncedAt: sql`excluded.synced_at`,
          },
          setWhere: sql`excluded.updated_at > ${profiles.updatedAt}`,
        })
    }
  })

  const taskIds = taskInputs.map((task) => task.id)
  const tagIds = tagInputs.map((tag) => tag.id)
  const paletteIds = paletteInputs.map((palette) => palette.id)

  const authoritativeTasks =
    taskIds.length > 0
      ? await db
          .select()
          .from(tasks)
          .where(and(eq(tasks.userId, user.id), inArray(tasks.id, taskIds)))
      : []

  const authoritativeTags =
    tagIds.length > 0
      ? await db
          .select()
          .from(tags)
          .where(and(eq(tags.userId, user.id), inArray(tags.id, tagIds)))
      : []

  const authoritativePalettes =
    paletteIds.length > 0
      ? await db
          .select()
          .from(palettes)
          .where(and(eq(palettes.userId, user.id), inArray(palettes.id, paletteIds)))
      : []

  const authoritativeProfile = profileInput
    ? ((await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1))[0] ??
      null)
    : null

  return c.json({
    serverTime,
    tasks: authoritativeTasks.map(toTaskDto),
    tags: authoritativeTags.map(toTagDto),
    palettes: authoritativePalettes.map(toPaletteDto),
    profile: authoritativeProfile ? toProfileDto(authoritativeProfile) : null,
  })
})

export { syncRoutes }
