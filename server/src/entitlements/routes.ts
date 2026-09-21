import { and, eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { db } from '../db/index.js'
import { entitlements } from '../db/schema.js'
import { env } from '../env.js'
import { requireAuth, type AuthVariables } from '../auth/middleware.js'

const entitlementRoutes = new Hono<{ Variables: AuthVariables }>()

const PRO_FEATURE = 'pro'
const MAX_CODE_LENGTH = 64

interface EntitlementSummary {
  plan: 'free' | 'pro'
  features: string[]
  expiresAt: number | null
}

async function loadEntitlements(userId: string): Promise<EntitlementSummary> {
  const rows = await db
    .select({
      feature: entitlements.feature,
      expiresAt: entitlements.expiresAt,
    })
    .from(entitlements)
    .where(and(eq(entitlements.userId, userId), eq(entitlements.status, 'active')))

  const now = Date.now()
  const features: string[] = []
  let expiresAt: number | null = null

  for (const row of rows) {
    const expiry = row.expiresAt ? row.expiresAt.getTime() : null
    if (expiry !== null && expiry <= now) continue
    features.push(row.feature)
    if (expiry !== null) {
      expiresAt = expiresAt === null ? expiry : Math.min(expiresAt, expiry)
    }
  }

  return {
    plan: features.includes(PRO_FEATURE) ? 'pro' : 'free',
    features,
    expiresAt,
  }
}

entitlementRoutes.get('/entitlements', requireAuth, async (c) => {
  const user = c.get('user')
  return c.json(await loadEntitlements(user.id))
})

entitlementRoutes.post('/redeem', requireAuth, async (c) => {
  const body = await c.req.json().catch(() => null)
  if (typeof body !== 'object' || body === null) {
    return c.json({ error: '请求格式不正确' }, 400)
  }

  const raw = body as Record<string, unknown>
  const code = typeof raw.code === 'string' ? raw.code.trim() : ''
  if (!code || code.length > MAX_CODE_LENGTH) {
    return c.json({ error: '请输入有效的兑换码' }, 400)
  }

  const normalized = code.toUpperCase()
  const valid = env.redeemCodes.some(
    (candidate) => candidate.toUpperCase() === normalized,
  )
  if (!valid) {
    return c.json({ error: '兑换码无效或已失效' }, 400)
  }

  const user = c.get('user')
  await db
    .insert(entitlements)
    .values({
      userId: user.id,
      feature: PRO_FEATURE,
      source: 'redeem',
      status: 'active',
    })
    .onConflictDoUpdate({
      target: [entitlements.userId, entitlements.feature],
      set: {
        source: 'redeem',
        status: 'active',
        grantedAt: new Date(),
        expiresAt: null,
      },
    })

  return c.json(await loadEntitlements(user.id))
})

export { entitlementRoutes }
