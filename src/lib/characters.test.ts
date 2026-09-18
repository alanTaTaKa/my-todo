/// <reference types="node" />
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  CHARACTER_MAP,
  getCharacterAvatar,
  getCharacterImage,
} from './characters'
import { THEME_IDS } from './themes'

test('character map only references known themes', () => {
  for (const id of Object.keys(CHARACTER_MAP)) {
    assert.ok(THEME_IDS.includes(id as (typeof THEME_IDS)[number]))
  }
})

test('character image paths live under /characters/', () => {
  for (const value of Object.values(CHARACTER_MAP)) {
    assert.match(value as string, /^\/characters\/[a-z0-9_-]+\.png$/)
  }
})

test('xiaowu theme maps to its illustration and avatar', () => {
  assert.equal(getCharacterImage('xiaowu'), '/characters/xiaowu.png')
  assert.equal(getCharacterAvatar('xiaowu'), '/characters/xiaowu-avatar.png')
})

test('themes without characters expose nothing', () => {
  assert.equal(getCharacterImage('fresh'), null)
  assert.equal(getCharacterAvatar('fresh'), null)
})
