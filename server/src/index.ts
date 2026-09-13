import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { authRoutes } from './auth/routes.js'
import type { AuthVariables } from './auth/middleware.js'
import { env } from './env.js'

const app = new Hono<{ Variables: AuthVariables }>()

app.use('*', logger())
app.use(
  '/api/*',
  cors({
    origin: env.appOrigin,
    credentials: true,
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
  }),
)

app.get('/api/health', (c) => c.json({ ok: true }))
app.route('/api/auth', authRoutes)

app.notFound((c) => c.json({ error: '接口不存在' }, 404))
app.onError((error, c) => {
  console.error(error)
  return c.json({ error: '服务器内部错误' }, 500)
})

serve({ fetch: app.fetch, port: env.port, hostname: '0.0.0.0' }, (info) => {
  console.log(`API 服务已启动：http://localhost:${info.port}`)
})
