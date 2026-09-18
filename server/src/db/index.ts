import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { env } from '../env.js'
import * as schema from './schema.js'

export const pool = new Pool({
  connectionString: env.databaseUrl,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
})

pool.on('error', (error) => {
  console.error('数据库连接池错误：', error.message)
})

export const db = drizzle(pool, { schema })
