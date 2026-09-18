/// <reference types="node" />
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildCustomThemeCss, deriveCustomTheme } from './customTheme'
import type { CustomPalette } from './palettes'

const malicious: CustomPalette = {
  id: 'x',
  name: 'evil',
  mode: 'dual',
  colors: [
    '#fff;} html{background:url(javascript:alert(1))}',
    '#000000; --x: url(evil)',
  ],
}

test('deriveCustomTheme sanitizes malicious color strings', () => {
  const vars = deriveCustomTheme(malicious)
  for (const value of Object.values(vars)) {
    assert.doesNotMatch(value, /[{}]/)
    assert.doesNotMatch(value, /url\(|javascript:|expression\(/i)
  }
})

test('deriveCustomTheme exposes the semantic tokens', () => {
  const vars = deriveCustomTheme({
    id: 'ok',
    name: 'ok',
    mode: 'tri',
    colors: ['#f7f3eb', '#a2cfd5', '#5ba5b2'],
  })
  assert.match(vars['--bg-base'], /^#[0-9a-f]{6}$/)
  assert.match(vars['--color-gold'], /^#[0-9a-f]{6}$/)
  assert.match(vars['--bg-gradient'], /^linear-gradient\(/)
  assert.ok(vars['--color-on-accent'] === '#ffffff' || /^#[0-9a-f]{6}$/.test(vars['--color-on-accent']))
})

test('buildCustomThemeCss is scoped and cannot break out', () => {
  const css = buildCustomThemeCss(deriveCustomTheme(malicious))
  assert.ok(css.startsWith(':root[data-theme="custom"]{'))
  assert.ok(css.endsWith('}'))
  const body = css.slice(':root[data-theme="custom"]{'.length, -1)
  assert.doesNotMatch(body, /[{}]/)
})