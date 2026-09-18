/// <reference types="node" />
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { canonicalJson, mergeById } from './merge'

interface Item {
  id: string
  updatedAt: number
  value: string
  deletedAt: number | null
}

function same(a: Item, b: Item): boolean {
  return a.value === b.value && a.deletedAt === b.deletedAt
}

function item(
  id: string,
  updatedAt: number,
  value: string,
  deletedAt: number | null = null,
): Item {
  return { id, updatedAt, value, deletedAt }
}

test('canonicalJson ignores key order', () => {
  assert.equal(canonicalJson({ a: 1, b: 2 }), canonicalJson({ b: 2, a: 1 }))
  assert.equal(
    canonicalJson({ x: { a: 1, b: 2 } }),
    canonicalJson({ x: { b: 2, a: 1 } }),
  )
})

test('canonicalJson distinguishes content', () => {
  assert.notEqual(canonicalJson({ a: 1 }), canonicalJson({ a: 2 }))
})

test('mergeById returns same reference for empty incoming', () => {
  const base = [item('1', 100, 'A')]
  assert.strictEqual(mergeById(base, [], same), base)
})

test('mergeById inserts new records', () => {
  const base = [item('1', 100, 'A')]
  const result = mergeById(base, [item('2', 50, 'B')], same)
  assert.equal(result.length, 2)
  assert.equal(result.find((entry) => entry.id === '2')?.value, 'B')
})

test('mergeById ignores older writes', () => {
  const base = [item('1', 100, 'A')]
  assert.strictEqual(mergeById(base, [item('1', 50, 'OLD')], same), base)
})

test('mergeById applies newer writes', () => {
  const base = [item('1', 100, 'A')]
  const result = mergeById(base, [item('1', 150, 'NEW')], same)
  assert.equal(result.find((entry) => entry.id === '1')?.value, 'NEW')
})

test('mergeById no-ops equal timestamp + same content', () => {
  const base = [item('1', 100, 'A')]
  assert.strictEqual(mergeById(base, [item('1', 100, 'A')], same), base)
})

test('mergeById lets server win on equal timestamp + different content', () => {
  const base = [item('1', 100, 'A')]
  const result = mergeById(base, [item('1', 100, 'SERVER')], same)
  assert.equal(result.find((entry) => entry.id === '1')?.value, 'SERVER')
})