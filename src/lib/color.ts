export interface Rgb {
  r: number
  g: number
  b: number
}

export interface Hsl {
  h: number
  s: number
  l: number
}

export function normalizeHex(value: string): string | null {
  const raw = value.trim().replace(/^#/, '')
  if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(raw)) return null
  const expanded =
    raw.length === 3
      ? raw
          .split('')
          .map((char) => char + char)
          .join('')
      : raw
  return `#${expanded.toLowerCase()}`
}

export function parseHex(hex: string): Rgb {
  let value = hex.trim().replace('#', '')
  if (value.length === 3) {
    value = value
      .split('')
      .map((char) => char + char)
      .join('')
  }
  const num = Number.parseInt(value, 16)
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  }
}
export function toHex(color: Rgb | string): string {
  const rgb = typeof color === 'string' ? parseHex(color) : color
  const clamp = (value: number) =>
    Math.max(0, Math.min(255, Math.round(value)))
  return `#${[rgb.r, rgb.g, rgb.b]
    .map((value) => clamp(value).toString(16).padStart(2, '0'))
    .join('')}`
}

export function rgba(color: Rgb | string, alpha: number): string {
  const rgb = typeof color === 'string' ? parseHex(color) : color
  return `rgba(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)}, ${alpha})`
}

export function mix(a: Rgb | string, b: Rgb | string, t: number): Rgb {
  const ca = typeof a === 'string' ? parseHex(a) : a
  const cb = typeof b === 'string' ? parseHex(b) : b
  return {
    r: ca.r + (cb.r - ca.r) * t,
    g: ca.g + (cb.g - ca.g) * t,
    b: ca.b + (cb.b - ca.b) * t,
  }
}

function channelToLinear(value: number): number {
  const c = value / 255
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

export function relativeLuminance(color: Rgb | string): number {
  const rgb = typeof color === 'string' ? parseHex(color) : color
  return (
    0.2126 * channelToLinear(rgb.r) +
    0.7152 * channelToLinear(rgb.g) +
    0.0722 * channelToLinear(rgb.b)
  )
}

export function contrastRatio(a: Rgb | string, b: Rgb | string): number {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  const hi = Math.max(la, lb)
  const lo = Math.min(la, lb)
  return (hi + 0.05) / (lo + 0.05)
}

export function rgbToHsl(color: Rgb | string): Hsl {
  const rgb = typeof color === 'string' ? parseHex(color) : color
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  const d = max - min
  let h = 0
  let s = 0

  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1))
    switch (max) {
      case r:
        h = ((g - b) / d) % 6
        break
      case g:
        h = (b - r) / d + 2
        break
      default:
        h = (r - g) / d + 4
    }
    h *= 60
    if (h < 0) h += 360
  }

  return { h, s, l }
}

export function hslToRgb({ h, s, l }: Hsl): Rgb {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let r = 0
  let g = 0
  let b = 0

  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]

  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 }
}

export function adjustLightness(color: Rgb | string, delta: number): Rgb {
  const hsl = rgbToHsl(color)
  return hslToRgb({ ...hsl, l: Math.max(0, Math.min(1, hsl.l + delta)) })
}

export function adjustForContrast(
  base: Rgb | string,
  bg: Rgb | string,
  target: number,
  direction: 'darker' | 'lighter',
): Rgb {
  const hsl = rgbToHsl(base)
  const step = direction === 'darker' ? -0.02 : 0.02
  let l = hsl.l

  for (let i = 0; i < 60; i += 1) {
    const candidate = hslToRgb({ ...hsl, l })
    if (contrastRatio(candidate, bg) >= target) return candidate
    l += step
    if (l <= 0 || l >= 1) break
  }

  return direction === 'darker' ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 }
}
