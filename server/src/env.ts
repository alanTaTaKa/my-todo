import 'dotenv/config'

function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`缺少必需的环境变量：${name}`)
  }
  return value
}

function optionalNumber(name: string, fallback: number): number {
  const raw = process.env[name]
  if (!raw) return fallback
  const value = Number(raw)
  return Number.isFinite(value) ? value : fallback
}

function optionalList(name: string): string[] {
  const raw = process.env[name]
  if (!raw) return []
  return raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

const nodeEnv = process.env.NODE_ENV ?? 'development'

export const isProduction = nodeEnv === 'production'

export type CookieSameSite = 'Lax' | 'Strict' | 'None'

function resolveSameSite(): CookieSameSite {
  const raw = process.env.COOKIE_SAME_SITE
  if (raw === 'Lax' || raw === 'Strict' || raw === 'None') return raw
  return 'Lax'
}

export const env = {
  databaseUrl: required('DATABASE_URL'),
  port: optionalNumber('PORT', 8787),
  nodeEnv,
  appOrigin: process.env.APP_ORIGIN ?? 'http://localhost:5173',
  sessionTtlDays: optionalNumber('SESSION_TTL_DAYS', 30),
  cookieSameSite: resolveSameSite(),
  redeemCodes: optionalList('REDEEM_CODES'),
}

export const cookieSecure = isProduction || env.cookieSameSite === 'None'
