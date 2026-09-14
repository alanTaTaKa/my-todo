import { Hono } from 'hono'
import { db } from '../db/index.js'
import { feedback } from '../db/schema.js'
import {
  optionalAuth,
  type AuthUser,
  type AuthVariables,
} from '../auth/middleware.js'

const feedbackRoutes = new Hono<{ Variables: AuthVariables }>()

const MAX_CONTENT_LENGTH = 2000
const MAX_CONTACT_LENGTH = 200

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

feedbackRoutes.post('/', optionalAuth, async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!isObject(body)) {
    return c.json({ error: '请求格式不正确' }, 400)
  }

  const content = typeof body.content === 'string' ? body.content.trim() : ''
  if (!content) {
    return c.json({ error: '请填写反馈内容' }, 400)
  }
  if (content.length > MAX_CONTENT_LENGTH) {
    return c.json({ error: `反馈内容不能超过 ${MAX_CONTENT_LENGTH} 字` }, 400)
  }

  const contact =
    typeof body.contact === 'string'
      ? body.contact.trim().slice(0, MAX_CONTACT_LENGTH)
      : ''

  const user = c.get('user') as AuthUser | undefined

  await db.insert(feedback).values({
    content,
    contact: contact || null,
    userId: user?.id ?? null,
  })

  return c.json({ ok: true }, 201)
})

export { feedbackRoutes }
