/// <reference types="node" />
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { sortTasks } from './sort'
import type { Priority, Task } from '../types'

function task(
  id: string,
  overrides: Partial<Task> = {},
): Task {
  return {
    id,
    title: id,
    completed: false,
    priority: 'none',
    dueDate: null,
    createdAt: 0,
    completedAt: null,
    updatedAt: 0,
    deletedAt: null,
    purgedAt: null,
    tagIds: [],
    ...overrides,
  }
}

test('sortTasks by createdAt ascending and descending', () => {
  const tasks = [task('b', { createdAt: 2 }), task('a', { createdAt: 1 })]
  assert.deepEqual(
    sortTasks(tasks, 'created', 'asc').map((entry) => entry.id),
    ['a', 'b'],
  )
  assert.deepEqual(
    sortTasks(tasks, 'created', 'desc').map((entry) => entry.id),
    ['b', 'a'],
  )
})

test('sortTasks by priority ascending', () => {
  const tasks = [
    task('high', { priority: 'high' }),
    task('none', { priority: 'none' }),
    task('medium', { priority: 'medium' }),
    task('low', { priority: 'low' }),
  ]
  const order = sortTasks(tasks, 'priority', 'asc').map((entry) => entry.priority)
  assert.deepEqual(order, ['none', 'low', 'medium', 'high'] as Priority[])
})

test('sortTasks by dueDate keeps nulls last in both directions', () => {
  const tasks = [
    task('none'),
    task('late', { dueDate: 200 }),
    task('early', { dueDate: 100 }),
  ]
  assert.deepEqual(
    sortTasks(tasks, 'dueDate', 'asc').map((entry) => entry.id),
    ['early', 'late', 'none'],
  )
  assert.deepEqual(
    sortTasks(tasks, 'dueDate', 'desc').map((entry) => entry.id),
    ['late', 'early', 'none'],
  )
})