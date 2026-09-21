/// <reference types="node" />
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  MODE_IDS,
  MODES,
  THEMES,
  THEME_IDS,
  themesForMode,
  themesInMode,
  themeMode,
} from './themes'

test('theme ids are unique and cover custom/system', () => {
  assert.equal(new Set(THEME_IDS).size, THEME_IDS.length)
  assert.ok(THEME_IDS.includes('custom'))
  assert.ok(THEME_IDS.includes('system'))
})

test('every listed theme is part of the id list', () => {
  for (const theme of THEMES) {
    assert.ok(THEME_IDS.includes(theme.id))
  }
})

test('mode list matches mode ids', () => {
  const modeIds = MODES.map((mode) => mode.id)
  assert.deepEqual(modeIds, MODE_IDS)
})

test('preset themes declare a known mode', () => {
  for (const theme of THEMES) {
    if (theme.id === 'system') {
      assert.equal(theme.mode, undefined)
      continue
    }
    assert.ok(theme.mode && MODE_IDS.includes(theme.mode))
  }
})

test('themesForMode only returns global or matching themes', () => {
  for (const mode of MODE_IDS) {
    for (const theme of themesForMode(mode)) {
      assert.ok(theme.mode === undefined || theme.mode === mode)
    }
  }
  assert.ok(themesForMode('minimal').length >= 12)
})

test('themesInMode returns only that exact mode group', () => {
  assert.ok(themesInMode('anime').length >= 3)
  assert.ok(themesInMode('guofeng').length >= 2)
  for (const mode of MODE_IDS) {
    for (const theme of themesInMode(mode)) {
      assert.equal(theme.mode, mode)
    }
  }
})

test('custom and system themes have no mode', () => {
  assert.equal(themeMode('system'), null)
  assert.equal(themeMode('custom'), null)
  assert.equal(themeMode('t486'), 'anime')
  assert.equal(themeMode('qingdai'), 'guofeng')
})
