/// <reference types="node" />
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { matchesDateFilter } from './date'

const DAY = 86_400_000
const now = new Date(2026, 8, 16, 10, 0, 0).getTime()
const today = new Date(2026, 8, 16, 18, 0, 0).getTime()
const tomorrow = new Date(2026, 8, 17, 9, 0, 0).getTime()
const inFiveDays = new Date(2026, 8, 21, 9, 0, 0).getTime()
const inTenDays = new Date(2026, 8, 26, 9, 0, 0).getTime()
const yesterday = new Date(2026, 8, 15, 9, 0, 0).getTime()

test("filter 'all' always matches", () => {
  assert.equal(matchesDateFilter(null, 'all', false, now), true)
})

test("filter 'none' matches only null due dates", () => {
  assert.equal(matchesDateFilter(null, 'none', false, now), true)
  assert.equal(matchesDateFilter(today, 'none', false, now), false)
})

test("filter 'today' matches same calendar day", () => {
  assert.equal(matchesDateFilter(today, 'today', false, now), true)
  assert.equal(matchesDateFilter(tomorrow, 'today', false, now), false)
  assert.equal(matchesDateFilter(null, 'today', false, now), false)
})

test("filter 'tomorrow' uses +1 day window", () => {
  assert.equal(matchesDateFilter(tomorrow, 'tomorrow', false, now), true)
  assert.equal(matchesDateFilter(today, 'tomorrow', false, now), false)
})

test("filter 'overdue' excludes completed and future", () => {
  assert.equal(matchesDateFilter(yesterday, 'overdue', false, now), true)
  assert.equal(matchesDateFilter(yesterday, 'overdue', true, now), false)
  assert.equal(matchesDateFilter(today, 'overdue', false, now), false)
})

test("filter 'week' is within 7 days from start of today", () => {
  const start = new Date(2026, 8, 16, 0, 0, 0).getTime()
  assert.equal(matchesDateFilter(inFiveDays, 'week', false, now), true)
  assert.equal(matchesDateFilter(inTenDays, 'week', false, now), false)
  assert.equal(matchesDateFilter(start + 7 * DAY - 1, 'week', false, now), true)
  assert.equal(matchesDateFilter(start + 7 * DAY, 'week', false, now), false)
})