import {
  adjustForContrast,
  adjustLightness,
  contrastRatio,
  hslToRgb,
  mix,
  parseHex,
  relativeLuminance,
  rgbToHsl,
  rgba,
  toHex,
} from './color'
import type { CustomPalette } from './palettes'

const LIGHT_THRESHOLD = 0.179

export function deriveCustomTheme(
  palette: CustomPalette,
): Record<string, string> {
  const isTri = palette.colors.length >= 3
  const bg = palette.colors[0]
  const assist = palette.colors[1]
  const accent = isTri ? palette.colors[2] : palette.colors[1]

  const isLight = relativeLuminance(bg) > LIGHT_THRESHOLD
  const bgRgb = parseHex(bg)
  const direction = isLight ? 'darker' : 'lighter'

  const bgHsl = rgbToHsl(bg)
  const textBase = hslToRgb({
    h: bgHsl.h,
    s: Math.min(bgHsl.s, 0.3),
    l: bgHsl.l,
  })

  const ink = adjustForContrast(textBase, bg, 8, direction)
  const inkSoft = adjustForContrast(textBase, bg, 4.6, direction)

  const whiteContrast = contrastRatio('#ffffff', accent)
  const blackContrast = contrastRatio('#000000', accent)
  const onAccent =
    whiteContrast >= blackContrast
      ? '#ffffff'
      : toHex(adjustForContrast(accent, accent, 4.6, 'darker'))

  const goldSoft =
    onAccent === '#ffffff'
      ? adjustLightness(accent, -0.1)
      : adjustLightness(accent, 0.1)

  const cream = isLight
    ? mix(bg, '#ffffff', 0.82)
    : mix(bg, '#ffffff', 0.08)
  const sand = isLight
    ? mix(bg, '#000000', 0.06)
    : mix(bg, '#ffffff', 0.12)

  const chipAlpha = isLight ? 0.55 : 0.22
  const chipOverlay = isLight ? '#ffffff' : '#000000'
  const chipBg = mix(bg, chipOverlay, chipAlpha)
  const chipText = adjustForContrast(textBase, chipBg, 4.6, direction)

  const gradient = isLight
    ? `linear-gradient(160deg, ${toHex(mix(bg, '#ffffff', 0.35))} 0%, ${toHex(bgRgb)} 45%, ${toHex(mix(bg, '#000000', 0.06))} 100%)`
    : `linear-gradient(160deg, ${toHex(mix(bg, '#ffffff', 0.1))} 0%, ${toHex(bgRgb)} 45%, ${toHex(mix(bg, '#000000', 0.15))} 100%)`

  return {
    '--color-cream': toHex(cream),
    '--color-sand': toHex(sand),
    '--color-gold': toHex(accent),
    '--color-gold-soft': toHex(goldSoft),
    '--color-sage': toHex(assist),
    '--color-sage-soft': toHex(mix(bg, assist, 0.18)),
    '--color-ink': toHex(ink),
    '--color-ink-soft': toHex(inkSoft),
    '--color-on-accent': onAccent,
    '--color-surface': isLight
      ? 'rgba(255, 255, 255, 0.5)'
      : 'rgba(255, 255, 255, 0.06)',
    '--color-surface-soft': isLight
      ? 'rgba(255, 255, 255, 0.45)'
      : 'rgba(255, 255, 255, 0.05)',
    '--color-surface-2': isLight
      ? 'rgba(255, 255, 255, 0.62)'
      : 'rgba(255, 255, 255, 0.08)',
    '--color-surface-strong': isLight
      ? 'rgba(255, 255, 255, 0.78)'
      : 'rgba(255, 255, 255, 0.1)',
    '--color-surface-solid': isLight
      ? 'rgba(255, 255, 255, 0.95)'
      : rgba(mix(bg, '#ffffff', 0.14), 0.95),
    '--color-line': isLight ? rgba(ink, 0.14) : 'rgba(255, 255, 255, 0.12)',
    '--color-line-soft': isLight
      ? rgba(ink, 0.1)
      : 'rgba(255, 255, 255, 0.08)',
    '--color-overlay': isLight ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.6)',
    '--bg-base': toHex(bgRgb),
    '--bg-glow-1': `radial-gradient(1100px 560px at 12% -10%, ${rgba(accent, isLight ? 0.14 : 0.18)}, transparent 60%)`,
    '--bg-glow-2': `radial-gradient(900px 520px at 100% 0%, ${rgba(assist, isLight ? 0.14 : 0.16)}, transparent 55%)`,
    '--bg-glow-3': `radial-gradient(800px 600px at 50% 112%, ${rgba(mix(bg, '#ffffff', 0.45), isLight ? 0.5 : 0.14)}, transparent 62%)`,
    '--bg-gradient': gradient,
    '--color-chip': isLight
      ? 'rgba(255, 255, 255, 0.55)'
      : 'rgba(0, 0, 0, 0.22)',
    '--color-chip-line': isLight
      ? rgba(ink, 0.16)
      : 'rgba(255, 255, 255, 0.16)',
    '--color-chip-text': toHex(chipText),
  }
}

export function buildCustomThemeCss(vars: Record<string, string>): string {
  const body = Object.entries(vars)
    .map(([key, value]) => `${key}:${value};`)
    .join('')
  return `:root[data-theme="custom"]{${body}}`
}
