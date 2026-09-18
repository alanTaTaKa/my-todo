import type { ThemeId } from './themes'

export const CHARACTER_MAP: Partial<Record<ThemeId, string>> = {
  xiaowu: '/characters/xiaowu.png',
}

export function getCharacterImage(themeId: ThemeId): string | null {
  return CHARACTER_MAP[themeId] ?? null
}

export function getCharacterAvatar(themeId: ThemeId): string | null {
  const image = CHARACTER_MAP[themeId]
  return image ? image.replace(/\.png$/i, '-avatar.png') : null
}
