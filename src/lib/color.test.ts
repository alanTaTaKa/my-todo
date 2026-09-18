/// <reference types="node" />
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  adjustForContrast,
  contrastRatio,
  normalizeHex,
  parseHex,
  toHex,
} from './color'

test('normalizeHex expands shorthand and lowercases', () => {
  assert.equal(normalizeHex('#abc'), '#aabbcc')
  assert.equal(normalizeHex('AABBCC'), '#aabbcc')
})

test('normalizeHex rejects invalid or injected values', () => {
  assert.equal(normalizeHex('red'), null)
  assert.equal(normalizeHex('#fff;} html{background:red}'), null)
  assert.equal(normalizeHex('#12345'), null)
})

test('parseHex / toHex round-trip', () => {
  assert.deepEqual(parseHex('#ff8000'), { r: 255, g: 128, b: 0 })
  assert.equal(toHex({ r: 255, g: 128, b: 0 }), '#ff8000')
})

test('toHex clamps and rounds', () => {
  assert.equal(toHex({ r: 300, g: -5, b: 127.6 }), '#ff0080')
})

test('contrastRatio bounds', () => {
  assert.equal(contrastRatio('#ffffff', '#ffffff'), 1)
  assert.ok(contrastRatio('#000000', '#ffffff') > 20)
})

test('adjustForContrast reaches the target ratio', () => {
  const adjusted = adjustForContrast('#ffffff', '#ffffff', 4.5, 'darker')
  assert.ok(contrastRatio(adjusted, '#ffffff') >= 4.5)
})