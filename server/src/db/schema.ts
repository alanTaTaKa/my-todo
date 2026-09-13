import { sql } from 'drizzle-orm'
import {
  bigint,
  boolean,
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('users_created_at_idx').on(table.createdAt)],
)

export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tokenHash: text('token_hash').notNull().unique(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('sessions_user_id_idx').on(table.userId)],
)

export const tasks = pgTable(
  'tasks',
  {
    id: text('id').notNull(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    completed: boolean('completed').notNull().default(false),
    priority: text('priority').notNull().default('none'),
    dueDate: bigint('due_date', { mode: 'number' }),
    createdAt: bigint('created_at', { mode: 'number' }).notNull(),
    completedAt: bigint('completed_at', { mode: 'number' }),
    updatedAt: bigint('updated_at', { mode: 'number' }).notNull(),
    deletedAt: bigint('deleted_at', { mode: 'number' }),
    tagIds: text('tag_ids')
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    syncedAt: bigint('synced_at', { mode: 'number' }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.id] }),
    index('tasks_user_synced_idx').on(table.userId, table.syncedAt),
  ],
)

export const tags = pgTable(
  'tags',
  {
    id: text('id').notNull(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    color: text('color').notNull().default('gold'),
    createdAt: bigint('created_at', { mode: 'number' }).notNull(),
    updatedAt: bigint('updated_at', { mode: 'number' }).notNull(),
    deletedAt: bigint('deleted_at', { mode: 'number' }),
    syncedAt: bigint('synced_at', { mode: 'number' }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.id] }),
    index('tags_user_synced_idx').on(table.userId, table.syncedAt),
  ],
)
