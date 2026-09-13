import type { TagColorKey } from '../types'

export interface TagPalette {
  key: TagColorKey
  label: string
  soft: string
  strong: string
}

export const TAG_PALETTE: TagPalette[] = [
  { key: 'gold', label: '暖金', soft: '#f3e3c2', strong: '#b8842a' },
  { key: 'sage', label: '鼠尾草', soft: '#dcebda', strong: '#5f8a5b' },
  { key: 'sky', label: '天青', soft: '#d8e8ef', strong: '#4f7f97' },
  { key: 'rose', label: '玫瑰', soft: '#f3dcdc', strong: '#b56b6b' },
  { key: 'lavender', label: '薰衣草', soft: '#e4dff0', strong: '#7a6aa8' },
  { key: 'clay', label: '陶土', soft: '#f0e0d2', strong: '#a9744c' },
]

const PALETTE_MAP = Object.fromEntries(
  TAG_PALETTE.map((item) => [item.key, item]),
) as Record<TagColorKey, TagPalette>

export function getTagPalette(key: TagColorKey): TagPalette {
  return PALETTE_MAP[key] ?? TAG_PALETTE[0]
}
