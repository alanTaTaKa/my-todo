import { eq } from 'drizzle-orm'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import { Hono, type Context } from 'hono'
import { db } from '../db/index.js'
import { sessions, users } from '../db/schema.js'
import { env, cookieSecure } from '../env.js'
import { hashPassword, verifyPassword } from './password.js'
import {
  SESSION_COOKIE,
  requireAuth,
  type AuthUser,
  type AuthVariables,
} from './middleware.js'
import { generateSessionToken, hashSessionToken } from './session.js'

const authRoutes = new Hono<{ Variables: AuthVariables }>()

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_MIN_LENGTH = 8
const PASSWORD_MAX_LENGTH = 128

function parseCredentials(body: unknown):
  | { email: string; password: string }
  | { error: string } {
  if (typeof body !== 'object' || body === null) {
    return { error: '请求格式不正确' }
  }

  const raw = body as Record<string, unknown>
  const email = typeof raw.email === 'string' ? raw.email.trim().toLowerCase() : ''
  const password = typeof raw.password === 'string' ? raw.password : ''

  if (!email || !EMAIL_PATTERN.test(email) || email.length > 254) {
    return { error: '请输入有效的邮箱地址' }
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    return { error: `密码至少需要 ${PASSWORD_MIN_LENGTH} 位` }
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return { error: `密码不能超过 ${PASSWORD_MAX_LENGTH} 位` }
  }

  return { email, password }
}

function isUniqueViolation(error: unknown): boolean {
  let current: unknown = error
  for (let depth = 0; depth < 4 && current; depth += 1) {
    if (typeof current === 'object' && 'code' in current && current.code === '23505') {
      return true
    }
    current =
      typeof current === 'object' && 'cause' in current
        ? (current as { cause?: unknown }).cause
        : null
  }
  return false
}

async function issueSession(
  c: Context<{ Variables: AuthVariables }>,
  userId: string,
): Promise<void> {
  const token = generateSessionToken()
  const ttlSeconds = env.sessionTtlDays * 24 * 60 * 60
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000)

  await db.insert(sessions).values({
    tokenHash: hashSessionToken(token),
    userId,
    expiresAt,
  })

  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: env.cookieSameSite,
    secure: cookieSecure,
    path: '/',
    maxAge: ttlSeconds,
  })
}

function publicUser(user: AuthUser) {
  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
  }
}

authRoutes.post('/register', async (c) => {
  const parsed = parseCredentials(await c.req.json().catch(() => null))
  if ('error' in parsed) {
    return c.json({ error: parsed.error }, 400)
  }

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, parsed.email))
    .limit(1)
  if (existing.length > 0) {
    return c.json({ error: '该邮箱已注册，请直接登录' }, 409)
  }

  const passwordHash = await hashPassword(parsed.password)

  let created: AuthUser
  try {
    const rows = await db
      .insert(users)
      .values({ email: parsed.email, passwordHash })
      .returning({
        id: users.id,
        email: users.email,
        createdAt: users.createdAt,
      })
    created = rows[0]
  } catch (error) {
    if (isUniqueViolation(error)) {
      return c.json({ error: '该邮箱已注册，请直接登录' }, 409)
    }
    throw error
  }

  await issueSession(c, created.id)
  return c.json({ user: publicUser(created) }, 201)
})

authRoutes.post('/login', async (c) => {
  const parsed = parseCredentials(await c.req.json().catch(() => null))
  if ('error' in parsed) {
    return c.json({ error: parsed.error }, 400)
  }

  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      createdAt: users.createdAt,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .where(eq(users.email, parsed.email))
    .limit(1)

  const account = rows[0]
  if (!account || !(await verifyPassword(parsed.password, account.passwordHash))) {
    return c.json({ error: '邮箱或密码不正确' }, 401)
  }

  await issueSession(c, account.id)
  return c.json({
    user: publicUser({
      id: account.id,
      email: account.email,
      createdAt: account.createdAt,
    }),
  })
})

authRoutes.post('/logout', async (c) => {
  const token = getCookie(c, SESSION_COOKIE)
  if (token) {
    await db
      .delete(sessions)
      .where(eq(sessions.tokenHash, hashSessionToken(token)))
  }

  deleteCookie(c, SESSION_COOKIE, {
    path: '/',
    sameSite: env.cookieSameSite,
    secure: cookieSecure,
  })
  return c.json({ ok: true })
})

authRoutes.get('/me', requireAuth, (c) => {
  return c.json({ user: publicUser(c.get('user')) })
})

export { authRoutes }
