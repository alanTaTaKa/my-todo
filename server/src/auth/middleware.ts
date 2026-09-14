import { and, eq, gt } from 'drizzle-orm'
import { getCookie } from 'hono/cookie'
import type { MiddlewareHandler } from 'hono'
import { db } from '../db/index.js'
import { sessions, users } from '../db/schema.js'
import { hashSessionToken } from './session.js'

export const SESSION_COOKIE = 'daily_calm_session'

export interface AuthUser {
  id: string
  email: string
  createdAt: Date
}

export interface AuthVariables {
  user: AuthUser
}

async function findUserByToken(token: string): Promise<AuthUser | null> {
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      createdAt: users.createdAt,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(
      and(
        eq(sessions.tokenHash, hashSessionToken(token)),
        gt(sessions.expiresAt, new Date()),
      ),
    )
    .limit(1)

  return rows[0] ?? null
}

export const requireAuth: MiddlewareHandler<{ Variables: AuthVariables }> = async (
  c,
  next,
) => {
  const token = getCookie(c, SESSION_COOKIE)
  if (!token) {
    return c.json({ error: '未登录' }, 401)
  }

  const user = await findUserByToken(token)
  if (!user) {
    return c.json({ error: '登录状态已失效，请重新登录' }, 401)
  }

  c.set('user', user)
  await next()
  return undefined
}

export const optionalAuth: MiddlewareHandler<{ Variables: AuthVariables }> = async (
  c,
  next,
) => {
  const token = getCookie(c, SESSION_COOKIE)
  if (token) {
    const user = await findUserByToken(token)
    if (user) {
      c.set('user', user)
    }
  }

  await next()
  return undefined
}
