import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { bodyLimit } from 'hono/body-limit'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { secureHeaders } from 'hono/secure-headers'
import { authRoutes } from './auth/routes.js'
import { feedbackRoutes } from './feedback/routes.js'
import { syncRoutes } from './sync/routes.js'
import { rateLimit } from './middleware/rate-limit.js'
import type { AuthVariables } from './auth/middleware.js'
import { env } from './env.js'

const app = new Hono<{ Variables: AuthVariables }>()

app.use('*', logger())
app.use('*', secureHeaders())
app.use(
  '/api/*',
  cors({
    origin: env.appOrigin,
    credentials: true,
    allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
  }),
)
app.use(
  '/api/*',
  bodyLimit({
    maxSize: 2 * 1024 * 1024,
    onError: (c) => c.json({ error: '请求体过大' }, 413),
  }),
)
app.use('/api/auth/*', rateLimit({ windowMs: 60_000, max: 20 }))
app.use('/api/feedback', rateLimit({ windowMs: 60_000, max: 5 }))
app.use('/api/sync', rateLimit({ windowMs: 60_000, max: 120 }))

app.get('/api/health', (c) => c.json({ ok: true }))
app.route('/api/auth', authRoutes)
app.route('/api/sync', syncRoutes)
app.route('/api/feedback', feedbackRoutes)

app.notFound((c) => c.json({ error: '接口不存在' }, 404))
app.onError((error, c) => {
  console.error(error)
  return c.json({ error: '服务器内部错误' }, 500)
})

serve({ fetch: app.fetch, port: env.port, hostname: '0.0.0.0' }, (info) => {
  console.log(`API 服务已启动：http://localhost:${info.port}`)
})
